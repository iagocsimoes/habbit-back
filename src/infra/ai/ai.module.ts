import { Module } from '@nestjs/common'
import { AIProvider } from '@/domain/application/providers/ai-provider'
import { OpenAIProvider } from './openai-ai-provider'

@Module({
  providers: [
    {
      provide: AIProvider,
      useClass: OpenAIProvider,
    },
  ],
  exports: [AIProvider],
})
export class AIModule {}
