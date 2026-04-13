import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { Correction } from '@/domain/enterprise/entities/correction'
import { CorrectionRepository } from '../../repositories/correction-repository'
import { UserRepository } from '../../repositories/user-repository'
import { AIProvider } from '../../providers/ai-provider'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'
import { MonthlyLimitExceededError } from '../corrections/errors/monthly-limit-exceeded-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserPlan } from '@/domain/enterprise/entities/user'

interface TranscribeAndCorrectUseCaseRequest {
  userId: string
  audioBuffer: Buffer
  language?: string
}

type TranscribeAndCorrectUseCaseResponse = Either<
  ResourceNotFoundError | MonthlyLimitExceededError,
  {
    originalText: string
    correction: Correction
    duration: number
    monthlyUsage: number
    monthlyLimit: number
  }
>

const PLAN_LIMITS = {
  [UserPlan.PRO]: 3000,
}

@Injectable()
export class TranscribeAndCorrectUseCase {
  constructor(
    private correctionRepository: CorrectionRepository,
    private userRepository: UserRepository,
    private aiProvider: AIProvider,
  ) {}

  async execute({
    userId,
    audioBuffer,
    language = 'pt',
  }: TranscribeAndCorrectUseCaseRequest): Promise<TranscribeAndCorrectUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    const monthlyUsage =
      await this.correctionRepository.countByUserIdInCurrentMonth(userId)
    const limit = PLAN_LIMITS[user.plan]

    if (monthlyUsage >= limit) {
      return left(new MonthlyLimitExceededError())
    }

    const transcription = await this.aiProvider.transcribeAudio(
      audioBuffer,
      language,
    )

    const correctionResult = await this.aiProvider.correctText(
      transcription.text,
      language,
      user.correctionStyle,
    )

    const correction = Correction.create({
      userId: new UniqueEntityID(userId),
      originalText: transcription.text,
      correctedText: correctionResult.correctedText,
      changes: correctionResult.changes,
      language,
      tokensUsed: correctionResult.tokensUsed,
    })

    await this.correctionRepository.create(correction)

    return right({
      originalText: transcription.text,
      correction,
      duration: transcription.duration,
      monthlyUsage: monthlyUsage + 1,
      monthlyLimit: limit,
    })
  }
}
