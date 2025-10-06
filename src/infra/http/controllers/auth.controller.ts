import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { AuthenticateUserUseCase } from '@/domain/application/use-cases/auth/authenticate-user'
import { RegisterUserUseCase } from '@/domain/application/use-cases/auth/register-user'
import { UpdateUserShortcutUseCase } from '@/domain/application/use-cases/user/update-user-shortcut'
import { UpdateCorrectionStyleUseCase } from '@/domain/application/use-cases/user/update-correction-style'
import { AuthenticateDto } from '../dtos/authenticate.dto'
import { RegisterDto } from '../dtos/register.dto'
import { UpdateShortcutDto } from '../dtos/update-shortcut.dto'
import { UpdateCorrectionStyleDto } from '../dtos/update-correction-style.dto'
import { WrongCredentialsError } from '@/domain/application/use-cases/auth/errors/wrong-credentials-error'
import { UserAlreadyExistsError } from '@/domain/application/use-cases/auth/errors/user-already-exists-error'
import { ResourceNotFoundError } from '@/domain/application/use-cases/corrections/errors/resource-not-found-error'
import { Public } from '@/infra/auth/public.decorator'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { UserRepository } from '@/domain/application/repositories/user-repository'

@Controller('auth')
export class AuthController {
  constructor(
    private authenticateUser: AuthenticateUserUseCase,
    private registerUser: RegisterUserUseCase,
    private updateUserShortcut: UpdateUserShortcutUseCase,
    private updateCorrectionStyle: UpdateCorrectionStyleUseCase,
    private userRepository: UserRepository,
  ) {}

  @Post('login')
  @Public()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() body: AuthenticateDto) {
    const { email, password } = body

    const result = await this.authenticateUser.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof WrongCredentialsError) {
        throw new UnauthorizedException(error.message)
      }

      throw new UnauthorizedException()
    }

    const { accessToken } = result.value

    return {
      accessToken,
    }
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(
    @CurrentUser() currentUser: UserPayload,
    @Body() body: RegisterDto,
  ) {
    // Verifica se o usuário autenticado é ADMIN
    const user = await this.userRepository.findById(currentUser.sub)

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create new accounts')
    }

    const result = await this.registerUser.execute({
      email: body.email,
      password: body.password,
      name: body.name,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message)
      }

      throw new UnauthorizedException()
    }

    const { user: newUser } = result.value

    return {
      user: {
        id: newUser.id.toString(),
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    }
  }

  @Get('me')
  async me(@CurrentUser() user: UserPayload) {
    const currentUser = await this.userRepository.findById(user.sub)

    if (!currentUser) {
      throw new UnauthorizedException()
    }

    return {
      user: {
        id: currentUser.id.toString(),
        email: currentUser.email,
        name: currentUser.name,
        plan: currentUser.plan,
        role: currentUser.role,
        shortcut: currentUser.shortcut,
        correctionStyle: currentUser.correctionStyle,
        createdAt: currentUser.createdAt,
      },
    }
  }

  @Put('shortcut')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateShortcut(
    @CurrentUser() user: UserPayload,
    @Body() body: UpdateShortcutDto,
  ) {
    const result = await this.updateUserShortcut.execute({
      userId: user.sub,
      shortcut: body.shortcut,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException('User not found')
      }

      throw new UnauthorizedException()
    }

    return { message: 'Shortcut updated successfully' }
  }

  @Put('correction-style')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateCorrectionStyleEndpoint(
    @CurrentUser() user: UserPayload,
    @Body() body: UpdateCorrectionStyleDto,
  ) {
    const result = await this.updateCorrectionStyle.execute({
      userId: user.sub,
      correctionStyle: body.correctionStyle,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException('User not found')
      }

      throw new UnauthorizedException()
    }

    return { message: 'Correction style updated successfully' }
  }
}
