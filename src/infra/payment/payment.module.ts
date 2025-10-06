import { Module } from '@nestjs/common'
import { AbacatePayService } from './abacatepay.service'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [EnvModule],
  providers: [AbacatePayService],
  exports: [AbacatePayService],
})
export class PaymentModule {}
