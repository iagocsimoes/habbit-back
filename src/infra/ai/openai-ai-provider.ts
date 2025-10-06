import { Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import {
  AIProvider,
  CorrectionResult,
} from '@/domain/application/providers/ai-provider'
import { EnvService } from '../env/env.module'

@Injectable()
export class OpenAIProvider implements AIProvider {
  private openai: OpenAI

  constructor(private env: EnvService) {
    this.openai = new OpenAI({
      apiKey: this.env.get('OPENAI_API_KEY'),
    })
  }

  async correctText(
    text: string,
    language: string,
    correctionStyle = 'correct',
  ): Promise<CorrectionResult> {
    const languageMap: Record<string, string> = {
      pt: 'português',
      en: 'inglês',
      es: 'espanhol',
    }

    const languageName = languageMap[language] || 'português'

    const styleInstructions: Record<string, string> = {
      correct: `Corrija o seguinte texto, focando em:
- Gramática
- Ortografia
- Pontuação
- Coerência`,
      formal: `Corrija o texto e deixe-o muito formal e profissional, adequado para contextos corporativos ou acadêmicos. Ajuste:
- Gramática e ortografia
- Vocabulário técnico e elegante
- Tom respeitoso e objetivo`,
      informal: `Corrija o texto e deixe-o mais informal e descontraído, como uma conversa entre amigos. Ajuste:
- Gramática e ortografia básica
- Linguagem coloquial e expressões populares
- Tom leve e acessível`,
      concise: `Corrija o texto e torne-o mais conciso e direto ao ponto. Ajuste:
- Gramática e ortografia
- Remova redundâncias
- Use frases curtas e objetivas`,
      detailed: `Corrija o texto e torne-o mais detalhado e explicativo. Ajuste:
- Gramática e ortografia
- Adicione contexto e explicações
- Use descrições mais completas`,
    }

    const styleInstruction =
      styleInstructions[correctionStyle] || styleInstructions.correct

    const prompt = `Você é um assistente especializado em correção de texto em ${languageName}.

${styleInstruction}

Texto original:
${text}

IMPORTANTE: Retorne APENAS o texto corrigido/ajustado, sem nenhuma explicação adicional, introdução ou conclusão.`

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um corretor de texto especializado. Retorne apenas o texto corrigido, sem explicações.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Reduzido para respostas mais determinísticas e rápidas
      max_tokens: 1000, // Reduzido para limitar o tamanho da resposta
    })

    const correctedText =
      completion.choices[0]?.message?.content?.trim() || text
    const tokensUsed = completion.usage?.total_tokens || 0

    return {
      correctedText,
      tokensUsed,
    }
  }

  async *correctTextStream(
    text: string,
    language: string,
    correctionStyle = 'correct',
  ): AsyncIterable<string> {
    const languageMap: Record<string, string> = {
      pt: 'português',
      en: 'inglês',
      es: 'espanhol',
    }

    const languageName = languageMap[language] || 'português'

    const styleInstructions: Record<string, string> = {
      correct: `Corrija o seguinte texto, focando em:
- Gramática
- Ortografia
- Pontuação
- Coerência`,
      formal: `Corrija o texto e deixe-o muito formal e profissional, adequado para contextos corporativos ou acadêmicos. Ajuste:
- Gramática e ortografia
- Vocabulário técnico e elegante
- Tom respeitoso e objetivo`,
      informal: `Corrija o texto e deixe-o mais informal e descontraído, como uma conversa entre amigos. Ajuste:
- Gramática e ortografia básica
- Linguagem coloquial e expressões populares
- Tom leve e acessível`,
      concise: `Corrija o texto e torne-o mais conciso e direto ao ponto. Ajuste:
- Gramática e ortografia
- Remova redundâncias
- Use frases curtas e objetivas`,
      detailed: `Corrija o texto e torne-o mais detalhado e explicativo. Ajuste:
- Gramática e ortografia
- Adicione contexto e explicações
- Use descrições mais completas`,
    }

    const styleInstruction =
      styleInstructions[correctionStyle] || styleInstructions.correct

    const prompt = `Você é um assistente especializado em correção de texto em ${languageName}.

${styleInstruction}

Texto original:
${text}

IMPORTANTE: Retorne APENAS o texto corrigido/ajustado, sem nenhuma explicação adicional, introdução ou conclusão.`

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um corretor de texto especializado. Retorne apenas o texto corrigido, sem explicações.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}
