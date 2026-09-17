import { describe, expect, test } from 'bun:test'
import sinon from 'sinon'
import { AssignmentRepository } from '../repositories/assignment.repository'
import { AssignmentService } from './assignment.service'

const valid = {
  staffId: 'staff-1',
  jobId: 'job-1',
  startDate: '2026-03-01',
  endDate: '2026-03-10',
}
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

function stubRefs(assignments: sinon.SinonStubbedInstance<AssignmentRepository>) {
  assignments.existsStaff.resolves(true)
  assignments.existsJob.resolves(true)
  assignments.createExclusive.resolves('created')
}

describe('AssignmentService', () => {
  test('create persists UUID, ISO-8601, trimmed ids and dates', async () => {
    const assignments = sinon.createStubInstance(AssignmentRepository)
    stubRefs(assignments)
    const service = new AssignmentService(assignments)

    const created = await service.create({
      staffId: '  staff-1  ',
      jobId: '  job-1  ',
      startDate: '  2026-03-01  ',
      endDate: '  2026-03-10  ',
    })

    expect(created.id).toMatch(UUID)
    expect(created.createdAt).toMatch(ISO_8601)
    expect(created.staffId).toBe('staff-1')
    expect(created.jobId).toBe('job-1')
    expect(created.startDate).toBe('2026-03-01')
    expect(created.endDate).toBe('2026-03-10')
    expect(assignments.createExclusive.calledOnce).toBe(true)
    expect(assignments.createExclusive.firstCall.args[0]).toEqual(created)
  })

  test('create with blank or omitted fields throws 400 and does not call createExclusive', async () => {
    const cases = [
      { staffId: '', jobId: 'job-1', startDate: '2026-03-01', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: '', startDate: '2026-03-01', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: 'job-1', startDate: '', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: 'job-1', startDate: '2026-03-01', endDate: '' },
      { staffId: '   ', jobId: 'job-1', startDate: '2026-03-01', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: '   ', startDate: '2026-03-01', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: 'job-1', startDate: '   ', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: 'job-1', startDate: '2026-03-01', endDate: '   ' },
      { jobId: 'job-1', startDate: '2026-03-01', endDate: '2026-03-10' },
      { staffId: 'staff-1', startDate: '2026-03-01', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: 'job-1', endDate: '2026-03-10' },
      { staffId: 'staff-1', jobId: 'job-1', startDate: '2026-03-01' },
    ]

    for (const input of cases) {
      const assignments = sinon.createStubInstance(AssignmentRepository)
      const service = new AssignmentService(assignments)

      try {
        await service.create(input)
        throw new Error(`expected create to throw for ${JSON.stringify(input)}`)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error & { statusCode: number }).statusCode).toBe(400)
        expect((error as Error).message).toBe(
          'staffId, jobId, startDate, and endDate are required',
        )
      }

      expect(assignments.createExclusive.notCalled).toBe(true)
    }
  })

  test('create with 2026-3-1, 01/03/2026, or ISO datetime throws 400 YYYY-MM-DD', async () => {
    const invalid = ['2026-3-1', '01/03/2026', '2026-03-01T00:00:00.000Z']

    for (const value of invalid) {
      for (const field of ['startDate', 'endDate'] as const) {
        const assignments = sinon.createStubInstance(AssignmentRepository)
        const service = new AssignmentService(assignments)

        try {
          await service.create({ ...valid, [field]: value })
          throw new Error(`expected create to throw for ${field}=${value}`)
        } catch (error) {
          expect((error as Error & { statusCode: number }).statusCode).toBe(400)
          expect((error as Error).message).toBe('startDate and endDate must be YYYY-MM-DD')
        }

        expect(assignments.createExclusive.notCalled).toBe(true)
      }
    }
  })

  test('create with 2026-02-29 or 2026-13-01 throws 400 YYYY-MM-DD', async () => {
    for (const value of ['2026-02-29', '2026-13-01']) {
      for (const field of ['startDate', 'endDate'] as const) {
        const assignments = sinon.createStubInstance(AssignmentRepository)
        const service = new AssignmentService(assignments)

        try {
          await service.create({ ...valid, [field]: value })
          throw new Error(`expected create to throw for ${field}=${value}`)
        } catch (error) {
          expect((error as Error & { statusCode: number }).statusCode).toBe(400)
          expect((error as Error).message).toBe('startDate and endDate must be YYYY-MM-DD')
        }

        expect(assignments.createExclusive.notCalled).toBe(true)
      }
    }
  })

  test('create with endDate before startDate throws 400', async () => {
    const assignments = sinon.createStubInstance(AssignmentRepository)
    const service = new AssignmentService(assignments)

    try {
      await service.create({ ...valid, startDate: '2026-03-10', endDate: '2026-03-01' })
      throw new Error('expected create to throw')
    } catch (error) {
      expect((error as Error & { statusCode: number }).statusCode).toBe(400)
      expect((error as Error).message).toBe('endDate must be on or after startDate')
    }

    expect(assignments.createExclusive.notCalled).toBe(true)
  })

  test('create with the same startDate and endDate persists', async () => {
    const assignments = sinon.createStubInstance(AssignmentRepository)
    stubRefs(assignments)
    const service = new AssignmentService(assignments)

    const created = await service.create({
      ...valid,
      startDate: '2026-03-01',
      endDate: '2026-03-01',
    })

    expect(created.startDate).toBe('2026-03-01')
    expect(created.endDate).toBe('2026-03-01')
    expect(assignments.createExclusive.calledOnce).toBe(true)
  })

  test('create with missing Staff or Job throws 400 and does not call createExclusive', async () => {
    const cases = [
      { staff: false, job: true },
      { staff: true, job: false },
    ]

    for (const refs of cases) {
      const assignments = sinon.createStubInstance(AssignmentRepository)
      assignments.existsStaff.resolves(refs.staff)
      assignments.existsJob.resolves(refs.job)
      const service = new AssignmentService(assignments)

      try {
        await service.create(valid)
        throw new Error('expected create to throw')
      } catch (error) {
        expect((error as Error & { statusCode: number }).statusCode).toBe(400)
        expect((error as Error).message).toBe('Staff or Job not found')
      }

      expect(assignments.createExclusive.notCalled).toBe(true)
    }
  })

  test('create maps overlap to 409 Staff already assigned', async () => {
    const assignments = sinon.createStubInstance(AssignmentRepository)
    assignments.existsStaff.resolves(true)
    assignments.existsJob.resolves(true)
    assignments.createExclusive.resolves('overlap')
    const service = new AssignmentService(assignments)

    try {
      await service.create(valid)
      throw new Error('expected create to throw')
    } catch (error) {
      expect((error as Error & { statusCode: number }).statusCode).toBe(409)
      expect((error as Error).message).toBe('Staff already assigned')
    }
  })

  test('deleteById succeeds when the repository deletes the row', async () => {
    const assignments = sinon.createStubInstance(AssignmentRepository)
    assignments.deleteById.resolves(true)
    const service = new AssignmentService(assignments)
    await service.deleteById('assignment-1')
    expect(assignments.deleteById.calledOnceWith('assignment-1')).toBe(true)
  })

  test('deleteById throws 404 when the repository deletes nothing', async () => {
    const assignments = sinon.createStubInstance(AssignmentRepository)
    assignments.deleteById.resolves(false)
    const service = new AssignmentService(assignments)

    try {
      await service.deleteById('missing')
      throw new Error('expected deleteById to throw')
    } catch (error) {
      expect((error as Error & { statusCode: number }).statusCode).toBe(404)
      expect((error as Error).message).toBe('Assignment not found')
    }
  })
})
