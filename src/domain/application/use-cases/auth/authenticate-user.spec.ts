import { InMemoryUserRepository } from 'test/repositories/in-memory-user-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { AuthenticateUserUseCase } from './authenticate-user'
import { makeUser } from 'test/factories/make-user'
import { UserRole } from '@/domain/enterprise/entities/user'

let userRepository: InMemoryUserRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUserUseCase

describe('Authenticate User', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUserUseCase(userRepository, hasher, encrypter)
  })

  it('should be able to authenticate a user', async () => {
    const user = makeUser({
      email: 'john@example.com',
      passwordHash: await hasher.hash('123456'),
    })

    await userRepository.create(user)

    const result = await sut.execute({
      email: 'john@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should include user role and plan in the token', async () => {
    const user = makeUser({
      email: 'admin@example.com',
      passwordHash: await hasher.hash('123456'),
      role: UserRole.ADMIN,
    })

    await userRepository.create(user)

    const result = await sut.execute({
      email: 'admin@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const tokenPayload = JSON.parse(result.value.accessToken)
      expect(tokenPayload).toMatchObject({
        sub: user.id.toString(),
        role: 'ADMIN',
        plan: user.plan,
      })
    }
  })

  it('should not be able to authenticate with wrong email', async () => {
    const user = makeUser({
      email: 'john@example.com',
      passwordHash: await hasher.hash('123456'),
    })

    await userRepository.create(user)

    const result = await sut.execute({
      email: 'wrong@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
  })

  it('should not be able to authenticate with wrong password', async () => {
    const user = makeUser({
      email: 'john@example.com',
      passwordHash: await hasher.hash('123456'),
    })

    await userRepository.create(user)

    const result = await sut.execute({
      email: 'john@example.com',
      password: 'wrong-password',
    })

    expect(result.isLeft()).toBe(true)
  })
})
