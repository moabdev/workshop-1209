import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../db/client'
import { staff } from '../db/schema'

export type StaffRecord = {
  id: string
  name: string
  createdAt: string
}

export class StaffRepository {
  constructor(private readonly db: AppDatabase) {}

  async list(): Promise<StaffRecord[]> {
    const rows = await this.db.select().from(staff)
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    }))
  }

  async create(record: StaffRecord): Promise<void> {
    await this.db.insert(staff).values({
      id: record.id,
      name: record.name,
      createdAt: record.createdAt,
    })
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(staff)
      .where(eq(staff.id, id))
      .returning({ id: staff.id })
    return deleted.length > 0
  }
}
