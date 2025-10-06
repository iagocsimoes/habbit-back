import { Module } from '@nestjs/common'
import { AuthController } from './controllers/auth.controller'
import { CorrectionsController } from './controllers/corrections.controller'
import { PaymentController } from './controllers/payment.controller'
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/auth/authenticate-user'
import { RegisterUserUseCase } from '@/domain/application/use-cases/auth/register-user'
import { UpdateUserShortcutUseCase } from '@/domain/application/use-cases/user/update-user-shortcut'
import { UpdateCorrectionStyleUseCase } from '@/domain/application/use-cases/user/update-correction-style'
import { CorrectTextUseCase } from '@/domain/application/use-cases/corrections/correct-text'
import { CorrectTextStreamUseCase } from '@/domain/application/use-cases/corrections/correct-text-stream'
import { GetUserStatsUseCase } from '@/domain/application/use-cases/corrections/get-user-stats'
import { ListUserCorrectionsUseCase } from '@/domain/application/use-cases/corrections/list-user-corrections'
import { GetCorrectionUseCase } from '@/domain/application/use-cases/corrections/get-correction'
import { DeleteCorrectionUseCase } from '@/domain/application/use-cases/corrections/delete-correction'
import { CreateBillingUseCase } from '@/domain/application/use-cases/payment/create-billing'
import { CreateBillingPublicUseCase } from '@/domain/application/use-cases/payment/create-billing-public'
import { HandleAbacatePayWebhookUseCase } from '@/domain/application/use-cases/payment/handle-abacatepay-webhook'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { AIModule } from '../ai/ai.module'
import { PaymentModule } from '../payment/payment.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [DatabaseModule, CryptographyModule, AIModule, PaymentModule, MailModule],
  controllers: [AuthController, CorrectionsController, PaymentController],
  providers: [
    AuthenticateUserUseCase,
    RegisterUserUseCase,
    UpdateUserShortcutUseCase,
    UpdateCorrectionStyleUseCase,
    CorrectTextUseCase,
    CorrectTextStreamUseCase,
    GetUserStatsUseCase,
    ListUserCorrectionsUseCase,
    GetCorrectionUseCase,
    DeleteCorrectionUseCase,
    CreateBillingUseCase,
    CreateBillingPublicUseCase,
    HandleAbacatePayWebhookUseCase,
  ],
})
export class HttpModule {}
