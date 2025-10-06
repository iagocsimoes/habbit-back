import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
  Sse,
  MessageEvent,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { CorrectTextUseCase } from '@/domain/application/use-cases/corrections/correct-text'
import { CorrectTextStreamUseCase } from '@/domain/application/use-cases/corrections/correct-text-stream'
import { GetUserStatsUseCase } from '@/domain/application/use-cases/corrections/get-user-stats'
import { ListUserCorrectionsUseCase } from '@/domain/application/use-cases/corrections/list-user-corrections'
import { GetCorrectionUseCase } from '@/domain/application/use-cases/corrections/get-correction'
import { DeleteCorrectionUseCase } from '@/domain/application/use-cases/corrections/delete-correction'
import { CorrectTextDto } from '../dtos/correct-text.dto'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { MonthlyLimitExceededError } from '@/domain/application/use-cases/corrections/errors/monthly-limit-exceeded-error'
import { ResourceNotFoundError } from '@/domain/application/use-cases/corrections/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

@Controller('corrections')
export class CorrectionsController {
  constructor(
    private correctText: CorrectTextUseCase,
    private correctTextStream: CorrectTextStreamUseCase,
    private getUserStats: GetUserStatsUseCase,
    private listUserCorrections: ListUserCorrectionsUseCase,
    private getCorrection: GetCorrectionUseCase,
    private deleteCorrection: DeleteCorrectionUseCase,
  ) {}

  @Sse('stream')
  async stream(
    @Query('text') text: string,
    @Query('language') language: string = 'pt',
    @CurrentUser() user: UserPayload,
  ): Promise<Observable<MessageEvent>> {
    const result = await this.correctTextStream.execute({
      userId: user.sub,
      text,
      language,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof MonthlyLimitExceededError) {
        throw new BadRequestException(error.message)
      }

      throw new BadRequestException('Failed to correct text')
    }

    const { stream } = result.value

    return new Observable((observer) => {
      ;(async () => {
        try {
          for await (const chunk of stream) {
            observer.next({ data: chunk })
          }
          observer.complete()
        } catch (error) {
          observer.error(error)
        }
      })()
    })
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @CurrentUser() user: UserPayload,
    @Body() body: CorrectTextDto,
  ) {
    const { text, language = 'pt' } = body

    const result = await this.correctText.execute({
      userId: user.sub,
      text,
      language,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof MonthlyLimitExceededError) {
        throw new BadRequestException(error.message)
      }

      throw new BadRequestException('Failed to correct text')
    }

    const { correction, monthlyUsage, monthlyLimit } = result.value

    return {
      correction: {
        id: correction.id.toString(),
        originalText: correction.originalText,
        correctedText: correction.correctedText,
        changes: correction.changes,
        language: correction.language,
        tokensUsed: correction.tokensUsed,
        createdAt: correction.createdAt,
      },
      usage: {
        monthly: monthlyUsage,
        limit: monthlyLimit,
        remaining:
          monthlyLimit === 'unlimited'
            ? 'unlimited'
            : (monthlyLimit as number) - monthlyUsage,
      },
    }
  }

  @Get('stats')
  async stats(@CurrentUser() user: UserPayload) {
    const result = await this.getUserStats.execute({
      userId: user.sub,
    })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to get stats')
    }

    return result.value
  }

  @Get()
  async list(
    @CurrentUser() user: UserPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
  ) {
    const result = await this.listUserCorrections.execute({
      userId: user.sub,
      page,
      perPage,
    })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to list corrections')
    }

    return {
      corrections: result.value.corrections.map((correction) => ({
        id: correction.id.toString(),
        originalText: correction.originalText,
        correctedText: correction.correctedText,
        changes: correction.changes,
        language: correction.language,
        tokensUsed: correction.tokensUsed,
        createdAt: correction.createdAt,
      })),
    }
  }

  @Get(':id')
  async getById(
    @CurrentUser() user: UserPayload,
    @Param('id') correctionId: string,
  ) {
    const result = await this.getCorrection.execute({
      correctionId,
      userId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException('Correction not found')
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException('Not allowed')
      }

      throw new BadRequestException('Failed to get correction')
    }

    const { correction } = result.value

    return {
      correction: {
        id: correction.id.toString(),
        originalText: correction.originalText,
        correctedText: correction.correctedText,
        changes: correction.changes,
        language: correction.language,
        tokensUsed: correction.tokensUsed,
        createdAt: correction.createdAt,
      },
    }
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: UserPayload,
    @Param('id') correctionId: string,
  ) {
    const result = await this.deleteCorrection.execute({
      correctionId,
      userId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException('Correction not found')
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException('Not allowed')
      }

      throw new BadRequestException('Failed to delete correction')
    }

    return { message: 'Correction deleted successfully' }
  }
}
