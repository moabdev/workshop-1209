import { StaffRepository, type StaffRecord } from '../repositories/staff.repository'

export type StaffInput = {
  name?: string
}

export class StaffService {
  constructor(private readonly staff: StaffRepository) {}

  list(): Promise<StaffRecord[]> | StaffRecord[] {
    return this.staff.list()
  }

  async create(input: StaffInput): Promise<StaffRecord> {
    const name = input.name?.trim() ?? ''
    if (!name) {
      throw httpError('name is required', 400)
    }

    const record: StaffRecord = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    }

    try {
      await this.staff.create(record)
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw httpError('Staff already exists', 409)
      }
      throw error
    }

    return record
  }

  async deleteById(id: string): Promise<void> {
    let deleted: boolean
    try {
      deleted = await this.staff.deleteById(id)
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw httpError('Staff has Assignment', 409)
      }
      throw error
    }
    if (!deleted) {
      throw httpError('Staff not found', 404)
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
