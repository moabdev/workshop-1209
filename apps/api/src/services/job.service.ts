import { JobRepository, type JobRecord } from '../repositories/job.repository'

export type JobInput = {
  name?: string
}

export class JobService {
  constructor(private readonly jobs: JobRepository) {}

  list(): Promise<JobRecord[]> | JobRecord[] {
    return this.jobs.list()
  }

  async create(input: JobInput): Promise<JobRecord> {
    const name = input.name?.trim() ?? ''
    if (!name) {
      throw httpError('name is required', 400)
    }

    const job: JobRecord = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    }

    try {
      await this.jobs.create(job)
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw httpError('Job already exists', 409)
      }
      throw error
    }

    return job
  }

  async deleteById(id: string): Promise<void> {
    let deleted: boolean
    try {
      deleted = await this.jobs.deleteById(id)
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        if (await this.jobs.hasAssignment(id)) {
          throw httpError('Job has Assignment', 409)
        }
        throw httpError('Job has Movement', 409)
      }
      throw error
    }
    if (!deleted) {
      throw httpError('Job not found', 404)
    }
  }
}

function httpError(message: string, statusCode: number): Error {
  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = statusCode
  return error
}

function isUniqueViolation(error: unknown): boolean {
  return constraintFailed(error, 'SQLITE_CONSTRAINT_UNIQUE', 'UNIQUE constraint failed')
}

function isForeignKeyViolation(error: unknown): boolean {
  return constraintFailed(
    error,
    'SQLITE_CONSTRAINT_FOREIGNKEY',
    'FOREIGN KEY constraint failed',
  )
}

function constraintFailed(error: unknown, code: string, message: string): boolean {
  let current: unknown = error
  while (current && typeof current === 'object') {
    if ('code' in current && current.code === code) {
      return true
    }
    if (
      'message' in current &&
      typeof current.message === 'string' &&
      current.message.includes(message)
    ) {
      return true
    }
    current = 'cause' in current ? current.cause : undefined
  }
  return false
}
