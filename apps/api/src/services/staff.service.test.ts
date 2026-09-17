import { describe, expect, test } from 'bun:test'
import sinon from 'sinon'
import { StaffRepository } from '../repositories/staff.repository'
import { StaffService } from './staff.service'

const valid = { name: 'Ana' }
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

function uniqueByCode() {
  return Object.assign(new Error('UNIQUE constraint failed: staff.name'), {
    code: 'SQLITE_CONSTRAINT_UNIQUE',
  })
}

function uniqueByMessage() {
  return new Error('UNIQUE constraint failed: staff.name')
}

function uniqueByCause() {
  return Object.assign(new Error('wrapped'), { cause: uniqueByCode() })
}

function foreignKeyByCode() {
  return Object.assign(new Error('FOREIGN KEY constraint failed'), {
    code: 'SQLITE_CONSTRAINT_FOREIGNKEY',
  })
}

describe('StaffService', () => {
  test('create with blank or omitted name throws 400 and does not call repository.create', async () => {
    for (const input of [{ name: '' }, { name: '   ' }, {}]) {
      const staff = sinon.createStubInstance(StaffRepository)
      const service = new StaffService(staff)

      try {
        await service.create(input)
        throw new Error(`expected create to throw for ${JSON.stringify(input)}`)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error & { statusCode: number }).statusCode).toBe(400)
        expect((error as Error).message).toBe('name is required')
      }

      expect(staff.create.notCalled).toBe(true)
    }
  })

  test('create trims name before repository.create', async () => {
    const staff = sinon.createStubInstance(StaffRepository)
    staff.create.resolves()
    const service = new StaffService(staff)

    await service.create({ name: '  Ana  ' })

    expect(staff.create.calledOnce).toBe(true)
    expect(staff.create.firstCall.args[0].name).toBe('Ana')
  })

  test('create persists a UUID id, ISO-8601 createdAt, and omits email, role, passwordHash, and quantity', async () => {
    const staff = sinon.createStubInstance(StaffRepository)
    staff.create.resolves()
    const service = new StaffService(staff)

    const created = await service.create(valid)

    expect(created.id).toMatch(UUID)
    expect(created.createdAt).toMatch(ISO_8601)
    expect(created.name).toBe('Ana')
    expect('email' in created).toBe(false)
    expect('role' in created).toBe(false)
    expect('passwordHash' in created).toBe(false)
    expect('quantity' in created).toBe(false)
    expect(staff.create.firstCall.args[0]).toEqual(created)
  })

  test('create maps a unique-constraint error to 409 Staff already exists', async () => {
    const errors = [uniqueByCode(), uniqueByMessage(), uniqueByCause()]

    for (const thrown of errors) {
      const staff = sinon.createStubInstance(StaffRepository)
      staff.create.rejects(thrown)
      const service = new StaffService(staff)

      try {
        await service.create(valid)
        throw new Error('expected create to throw')
      } catch (error) {
        expect((error as Error & { statusCode: number }).statusCode).toBe(409)
        expect((error as Error).message).toBe('Staff already exists')
      }
    }
  })

  test('deleteById succeeds when the repository deletes the row', async () => {
    const staff = sinon.createStubInstance(StaffRepository)
    staff.deleteById.resolves(true)
    const service = new StaffService(staff)
    await service.deleteById('staff-1')
    expect(staff.deleteById.calledOnceWith('staff-1')).toBe(true)
  })

  test('deleteById maps a foreign-key error to 409 Staff has Assignment', async () => {
    const staff = sinon.createStubInstance(StaffRepository)
    staff.deleteById.rejects(foreignKeyByCode())
    const service = new StaffService(staff)

    try {
      await service.deleteById('staff-1')
      throw new Error('expected deleteById to throw')
    } catch (error) {
      expect((error as Error & { statusCode: number }).statusCode).toBe(409)
      expect((error as Error).message).toBe('Staff has Assignment')
    }
  })

  test('deleteById throws 404 when the repository deletes nothing', async () => {
    const staff = sinon.createStubInstance(StaffRepository)
    staff.deleteById.resolves(false)
    const service = new StaffService(staff)

    try {
      await service.deleteById('missing')
      throw new Error('expected deleteById to throw')
    } catch (error) {
      expect((error as Error & { statusCode: number }).statusCode).toBe(404)
      expect((error as Error).message).toBe('Staff not found')
    }
  })
})
