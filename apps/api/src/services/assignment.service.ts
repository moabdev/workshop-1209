import {
  AssignmentRepository,
  type AssignmentRecord,
} from '../repositories/assignment.repository'

export type AssignmentInput = {
  staffId?: string
  jobId?: string
  startDate?: string
  endDate?: string
}

export class AssignmentService {
  constructor(private readonly assignments: AssignmentRepository) {}

  list(): Promise<AssignmentRecord[]> | AssignmentRecord[] {
    return this.assignments.list()
  }

  async create(input: AssignmentInput): Promise<AssignmentRecord> {
    const staffId = input.staffId?.trim() ?? ''
    const jobId = input.jobId?.trim() ?? ''
    const startDate = input.startDate?.trim() ?? ''
    const endDate = input.endDate?.trim() ?? ''
    if (!staffId || !jobId || !startDate || !endDate) {
      throw httpError('staffId, jobId, startDate, and endDate are required', 400)
    }
    if (!isCalendarDate(startDate) || !isCalendarDate(endDate)) {
      throw httpError('startDate and endDate must be YYYY-MM-DD', 400)
    }
    if (endDate < startDate) {
      throw httpError('endDate must be on or after startDate', 400)
    }

    if (!(await this.assignments.existsStaff(staffId)) || !(await this.assignments.existsJob(jobId))) {
      throw httpError('Staff or Job not found', 400)
    }

    const record: AssignmentRecord = {
      id: crypto.randomUUID(),
      staffId,
      jobId,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    }

    const result = await this.assignments.createExclusive(record)
    if (result === 'overlap') {
      throw httpError('Staff already assigned', 409)
    }

    return record
  }

  async deleteById(id: string): Promise<void> {
    const deleted = await this.assignments.deleteById(id)
    if (!deleted) {
      throw httpError('Assignment not found', 404)
    }
  }
}

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return false
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function httpError(message: string, statusCode: number): Error {
  const error = new Error(message) as Error & { statusCode: number }
  error.statusCode = statusCode
  return error
}
