import { Either, left, right } from '@/core/types/either'
import { User } from '@/domain/enterprise/entities/user'
import { UserRepository } from '../../repositories/user-repository'
import { HashGenerator } from '../../cryptography/hash-generator'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface RegisterUserUseCaseRequest {
  email: string
  password: string
  name?: string
}

type RegisterUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: User
  }
>

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    email,
    password,
    name,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(email)

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email))
    }

    const passwordHash = await this.hashGenerator.hash(password)

    const user = User.create({
      email,
      passwordHash,
      name,
    })

    await this.userRepository.create(user)

    return right({
      user,
    })
  }
}
