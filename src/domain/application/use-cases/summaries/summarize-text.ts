import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { AIProvider } from '../../providers/ai-provider'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'

interface SummarizeTextUseCaseRequest {
  userId: string
  text: string
  language?: string
  style?: string
}

type SummarizeTextUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    summary: string
    tokensUsed: number
  }
>

@Injectable()
export class SummarizeTextUseCase {
  constructor(
    private userRepository: UserRepository,
    private aiProvider: AIProvider,
  ) {}

  async execute({
    userId,
    text,
    language = 'pt',
    style = 'bullets',
  }: SummarizeTextUseCaseRequest): Promise<SummarizeTextUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    const result = await this.aiProvider.summarizeText(text, language, style)

    return right({
      summary: result.summary,
      tokensUsed: result.tokensUsed,
    })
  }
}
