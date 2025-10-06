import { Correction } from '@/domain/enterprise/entities/correction'

export abstract class CorrectionRepository {
  abstract create(correction: Correction): Promise<void>
  abstract findManyByUserId(
    userId: string,
    params: { page: number; perPage: number },
  ): Promise<Correction[]>
  abstract findById(id: string): Promise<Correction | null>
  abstract delete(id: string): Promise<void>
  abstract countByUserIdInCurrentMonth(userId: string): Promise<number>
  abstract getTotalTokensInCurrentMonth(userId: string): Promise<number>
}
