import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../db/client'
import { assignments, jobs } from '../db/schema'

export type JobRecord = {
  id: string
  name: string
  createdAt: string
}

export class JobRepository {
  constructor(private readonly db: AppDatabase) {}

  async list(): Promise<JobRecord[]> {
    const rows = await this.db.select().from(jobs)
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    }))
  }

  async create(job: JobRecord): Promise<void> {
    await this.db.insert(jobs).values({
      id: job.id,
      name: job.name,
      createdAt: job.createdAt,
    })
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(jobs)
      .where(eq(jobs.id, id))
      .returning({ id: jobs.id })
    return deleted.length > 0
  }

  async hasAssignment(id: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: assignments.id })
      .from(assignments)
      .where(eq(assignments.jobId, id))
      .limit(1)
    return rows.length > 0
  }
}
