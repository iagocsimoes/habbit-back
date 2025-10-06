import { Correction as PrismaCorrection, Prisma } from '@prisma/client'
import {
  Correction,
  TextChange,
} from '@/domain/enterprise/entities/correction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class PrismaCorrectionMapper {
  static toDomain(raw: PrismaCorrection): Correction {
    const changes = raw.changes
      ? (raw.changes as Prisma.JsonArray).map((change: any) => ({
          type: change.type,
          original: change.original,
          corrected: change.corrected,
          explanation: change.explanation,
        }))
      : undefined

    return Correction.create(
      {
        userId: new UniqueEntityID(raw.userId),
        originalText: raw.originalText,
        correctedText: raw.correctedText,
        changes,
        language: raw.language,
        tokensUsed: raw.tokensUsed,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    correction: Correction,
  ): Prisma.CorrectionUncheckedCreateInput {
    return {
      id: correction.id.toString(),
      userId: correction.userId.toString(),
      originalText: correction.originalText,
      correctedText: correction.correctedText,
      changes: correction.changes
        ? (correction.changes as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      language: correction.language,
      tokensUsed: correction.tokensUsed,
      createdAt: correction.createdAt,
    }
  }
}
