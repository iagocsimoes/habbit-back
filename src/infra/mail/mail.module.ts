import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [EnvModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
