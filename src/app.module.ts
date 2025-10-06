import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { envSchema } from './infra/env/env'
import { EnvModule } from './infra/env/env.module'
import { EnvService } from './infra/env/env.module'
import { CryptographyModule } from './infra/cryptography/cryptography.module'
import { DatabaseModule } from './infra/database/database.module'
import { HttpModule } from './infra/http/http.module'
import { AuthModule } from './infra/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [EnvService],
      useFactory(env: EnvService) {
        return {
          secret: env.get('JWT_SECRET'),
          signOptions: { expiresIn: env.get('JWT_EXPIRES_IN') },
        }
      },
    }),
    EnvModule,
    AuthModule,
    CryptographyModule,
    DatabaseModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
