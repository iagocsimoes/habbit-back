import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/types/either'
import { Correction } from '@/domain/enterprise/entities/correction'
import { CorrectionRepository } from '../../repositories/correction-repository'

interface ListUserCorrectionsUseCaseRequest {
  userId: string
  page: number
  perPage?: number
}

export interface ListUserCorrectionsUseCaseResponse {
  corrections: Correction[]
}

type ListUserCorrectionsUseCaseResult = Either<
  null,
  ListUserCorrectionsUseCaseResponse
>

@Injectable()
export class ListUserCorrectionsUseCase {
  constructor(private correctionRepository: CorrectionRepository) {}

  async execute({
    userId,
    page,
    perPage = 20,
  }: ListUserCorrectionsUseCaseRequest): Promise<ListUserCorrectionsUseCaseResult> {
    const corrections = await this.correctionRepository.findManyByUserId(
      userId,
      { page, perPage },
    )

    return right({ corrections })
  }
}
