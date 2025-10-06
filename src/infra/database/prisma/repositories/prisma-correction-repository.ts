import { Injectable } from '@nestjs/common'
import { CorrectionRepository } from '@/domain/application/repositories/correction-repository'
import { Correction } from '@/domain/enterprise/entities/correction'
import { PrismaService } from '../prisma.service'
import { PrismaCorrectionMapper } from '../mappers/prisma-correction-mapper'

@Injectable()
export class PrismaCorrectionRepository implements CorrectionRepository {
  constructor(private prisma: PrismaService) {}

  async create(correction: Correction): Promise<void> {
    const data = PrismaCorrectionMapper.toPrisma(correction)
    await this.prisma.correction.create({ data })
  }

  async findManyByUserId(
    userId: string,
    params: { page: number; perPage: number },
  ): Promise<Correction[]> {
    const corrections = await this.prisma.correction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    })

    return corrections.map(PrismaCorrectionMapper.toDomain)
  }

  async countByUserIdInCurrentMonth(userId: string): Promise<number> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return this.prisma.correction.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })
  }

  async getTotalTokensInCurrentMonth(userId: string): Promise<number> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const result = await this.prisma.correction.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        tokensUsed: true,
      },
    })

    return result._sum.tokensUsed ?? 0
  }

  async findById(id: string): Promise<Correction | null> {
    const correction = await this.prisma.correction.findUnique({
      where: { id },
    })

    if (!correction) {
      return null
    }

    return PrismaCorrectionMapper.toDomain(correction)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.correction.delete({
      where: { id },
    })
  }
}
