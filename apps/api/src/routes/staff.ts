import type { FastifyInstance } from 'fastify'
import { container, tokens } from '../container/container'
import { StaffService } from '../services/staff.service'

export async function staffRoutes(fastify: FastifyInstance) {
  const staff = container.get<StaffService>(tokens.staffService)

  fastify.get('/api/staff', async () => staff.list())

  fastify.post('/api/staff', async (request, reply) => {
    const body = (request.body ?? {}) as { name?: string }
    const record = await staff.create(body)
    return reply.status(201).send(record)
  })

  fastify.delete('/api/staff/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await staff.deleteById(id)
    return reply.status(204).send()
  })
}
