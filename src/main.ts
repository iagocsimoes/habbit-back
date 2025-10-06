import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './infra/env/env.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    rawBody: true, // Enable raw body for Stripe webhooks
  })

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  const envService = app.get(EnvService)
  const port = envService.get('PORT')

  await app.listen(port)

  console.log(`🚀 Server running on http://localhost:${port}`)
}
bootstrap()
