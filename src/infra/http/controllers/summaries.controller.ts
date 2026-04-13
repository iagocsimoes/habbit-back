import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { SummarizeTextUseCase } from '@/domain/application/use-cases/summaries/summarize-text'
import { SummarizeTextDto } from '../dtos/summarize-text.dto'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('summaries')
export class SummariesController {
  constructor(private summarizeText: SummarizeTextUseCase) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @CurrentUser() user: UserPayload,
    @Body() body: SummarizeTextDto,
  ) {
    const { text, language = 'pt', style = 'bullets' } = body

    const result = await this.summarizeText.execute({
      userId: user.sub,
      text,
      language,
      style,
    })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to summarize text')
    }

    return {
      summary: result.value.summary,
      tokensUsed: result.value.tokensUsed,
    }
  }
}
