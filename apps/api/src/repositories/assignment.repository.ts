import { and, eq, gte, lte } from 'drizzle-orm'
import type { AppDatabase } from '../db/client'
import { assignments, jobs, staff } from '../db/schema'

export type AssignmentRecord = {
  id: string
  staffId: string
  jobId: string
  startDate: string
  endDate: string
  createdAt: string
}

export class AssignmentRepository {
  constructor(private readonly db: AppDatabase) {}

  async list(): Promise<AssignmentRecord[]> {
    const rows = await this.db.select().from(assignments)
    return rows.map(toAssignment)
  }

  async existsStaff(id: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.id, id))
      .limit(1)
    return rows.length > 0
  }

  async existsJob(id: string): Promise<boolean> {
    const rows = await this.db.select({ id: jobs.id }).from(jobs).where(eq(jobs.id, id)).limit(1)
    return rows.length > 0
  }

  async createExclusive(record: AssignmentRecord): Promise<'created' | 'overlap'> {
    return this.db.transaction(async (tx) => {
      const overlapping = await tx
        .select({ id: assignments.id })
        .from(assignments)
        .where(
          and(
            eq(assignments.staffId, record.staffId),
            lte(assignments.startDate, record.endDate),
            gte(assignments.endDate, record.startDate),
          ),
        )
        .limit(1)
      if (overlapping.length > 0) {
        return 'overlap'
      }

      await tx.insert(assignments).values({
        id: record.id,
        staffId: record.staffId,
        jobId: record.jobId,
        startDate: record.startDate,
        endDate: record.endDate,
        createdAt: record.createdAt,
      })
      return 'created'
    })
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(assignments)
      .where(eq(assignments.id, id))
      .returning({ id: assignments.id })
    return deleted.length > 0
  }
}

function toAssignment(row: typeof assignments.$inferSelect): AssignmentRecord {
  return {
    id: row.id,
    staffId: row.staffId,
    jobId: row.jobId,
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt,
  }
}
