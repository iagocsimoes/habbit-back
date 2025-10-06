import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcrypt'

describe('Auth (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = moduleFixture.get<PrismaService>(PrismaService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('POST /auth/login', () => {
    it('should authenticate a user and return access token', async () => {
      const passwordHash = await hash('123456', 8)

      await prisma.user.create({
        data: {
          email: 'john@example.com',
          passwordHash,
          name: 'John Doe',
          plan: 'FREE',
          role: 'USER',
        },
      })

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: '123456',
        })
        .expect(201)

      expect(response.body).toEqual({
        accessToken: expect.any(String),
      })
    })

    it('should return 401 with wrong credentials', async () => {
      const passwordHash = await hash('123456', 8)

      await prisma.user.create({
        data: {
          email: 'john@example.com',
          passwordHash,
          name: 'John Doe',
          plan: 'FREE',
          role: 'USER',
        },
      })

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrong-password',
        })
        .expect(401)
    })
  })

  describe('GET /auth/me', () => {
    it('should return current user data', async () => {
      const passwordHash = await hash('123456', 8)

      await prisma.user.create({
        data: {
          email: 'john@example.com',
          passwordHash,
          name: 'John Doe',
          plan: 'PRO',
          role: 'ADMIN',
        },
      })

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: '123456',
        })

      const { accessToken } = loginResponse.body

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toEqual({
        user: {
          id: expect.any(String),
          email: 'john@example.com',
          name: 'John Doe',
          plan: 'PRO',
          role: 'ADMIN',
          createdAt: expect.any(String),
        },
      })
    })

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401)
    })

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })
})
