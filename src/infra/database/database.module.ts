import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaUserRepository } from './prisma/repositories/prisma-user-repository'
import { PrismaCorrectionRepository } from './prisma/repositories/prisma-correction-repository'
import { UserRepository } from '@/domain/application/repositories/user-repository'
import { CorrectionRepository } from '@/domain/application/repositories/correction-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: CorrectionRepository,
      useClass: PrismaCorrectionRepository,
    },
  ],
  exports: [PrismaService, UserRepository, CorrectionRepository],
})
export class DatabaseModule {}
