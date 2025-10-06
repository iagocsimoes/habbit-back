# Roadmap Backend Habbit

## ✅ Fase 1: Estrutura Base (CONCLUÍDO)

- [x] Setup do projeto NestJS com pnpm
- [x] Configuração do Prisma
- [x] Schema do banco de dados
- [x] Estrutura DDD completa
- [x] Core entities (Entity, AggregateRoot, UniqueEntityID)
- [x] Either monad para tratamento de erros
- [x] Entidades de domínio (User, Correction)
- [x] Contratos de repositórios
- [x] Contratos de cryptography
- [x] Use cases principais (Register, Authenticate, CorrectText)
- [x] Implementações de crypto (Bcrypt, JWT)
- [x] Validação de env com Zod
- [x] Path aliases configurados

---

## 🚧 Fase 2: Implementação de Repositórios (1-2 dias)

### 2.1 Repositórios Prisma

**Arquivo**: `src/infra/database/prisma/repositories/prisma-user-repository.ts`
```typescript
- [ ] Implementar PrismaUserRepository
  - [ ] findById()
  - [ ] findByEmail()
  - [ ] create()
  - [ ] save()
```

**Arquivo**: `src/infra/database/prisma/repositories/prisma-correction-repository.ts`
```typescript
- [ ] Implementar PrismaCorrectionRepository
  - [ ] create()
  - [ ] findManyByUserId()
  - [ ] countByUserIdInCurrentMonth()
```

### 2.2 Mappers (Prisma ↔ Domain)

**Arquivo**: `src/infra/database/prisma/mappers/prisma-user-mapper.ts`
```typescript
- [ ] toDomain(raw: PrismaUser): User
- [ ] toPrisma(user: User): PrismaUser
```

**Arquivo**: `src/infra/database/prisma/mappers/prisma-correction-mapper.ts`
```typescript
- [ ] toDomain(raw: PrismaCorrection): Correction
- [ ] toPrisma(correction: Correction): PrismaCorrection
```

### 2.3 Database Module

**Arquivo**: `src/infra/database/database.module.ts`
```typescript
- [ ] Criar DatabaseModule
- [ ] Registrar PrismaService
- [ ] Exportar repositórios
```

---

## 🚧 Fase 3: Providers e Integrações (2-3 dias)

### 3.1 AI Provider (OpenAI)

**Arquivo**: `src/infra/providers/openai-ai-provider.ts`
```typescript
- [ ] Implementar OpenAIProvider
- [ ] correctText(text, language)
- [ ] Configurar prompts otimizados
- [ ] Tratamento de erros da API
- [ ] Rate limiting interno
```

**Instalação:**
```bash
pnpm add openai
```

### 3.2 Providers Module

**Arquivo**: `src/infra/providers/providers.module.ts`
```typescript
- [ ] Criar ProvidersModule
- [ ] Registrar AIProvider
```

### 3.3 Cache com Redis (Opcional MVP, Essencial Produção)

**Arquivo**: `src/infra/cache/redis-cache.service.ts`
```typescript
- [ ] Implementar RedisService
- [ ] get(key)
- [ ] set(key, value, ttl)
- [ ] Cache de correções repetidas
```

**Instalação:**
```bash
pnpm add ioredis
pnpm add -D @types/ioredis
```

---

## 🚧 Fase 4: HTTP Layer (3-4 dias)

### 4.1 DTOs (Data Transfer Objects)

**Arquivo**: `src/infra/http/dtos/register-user.dto.ts`
```typescript
- [ ] RegisterUserDto
  - [ ] email (validação de email)
  - [ ] password (min 6 caracteres)
  - [ ] name (opcional)
```

**Arquivo**: `src/infra/http/dtos/authenticate-user.dto.ts`
```typescript
- [ ] AuthenticateUserDto
  - [ ] email
  - [ ] password
```

**Arquivo**: `src/infra/http/dtos/correct-text.dto.ts`
```typescript
- [ ] CorrectTextDto
  - [ ] text (max 5000 caracteres)
  - [ ] language (opcional, default 'pt')
```

**Instalação:**
```bash
pnpm add class-validator class-transformer
```

### 4.2 Presenters (Output Formatting)

**Arquivo**: `src/infra/http/presenters/user-presenter.ts`
```typescript
- [ ] UserPresenter.toHTTP(user: User)
  - [ ] Remove passwordHash
  - [ ] Formata datas
```

**Arquivo**: `src/infra/http/presenters/correction-presenter.ts`
```typescript
- [ ] CorrectionPresenter.toHTTP(correction: Correction)
```

### 4.3 Controllers

**Arquivo**: `src/infra/http/controllers/auth.controller.ts`
```typescript
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] GET /auth/me (com JWT guard)
```

**Arquivo**: `src/infra/http/controllers/corrections.controller.ts`
```typescript
- [ ] POST /corrections (requer auth)
- [ ] GET /corrections (histórico, requer auth)
- [ ] GET /corrections/stats (uso mensal, requer auth)
```

### 4.4 Auth Module (JWT Strategy & Guards)

**Arquivo**: `src/infra/auth/jwt.strategy.ts`
```typescript
- [ ] Implementar JwtStrategy
- [ ] Validar token
- [ ] Extrair payload (sub, plan)
- [ ] Carregar usuário
```

**Arquivo**: `src/infra/auth/jwt-auth.guard.ts`
```typescript
- [ ] Implementar JwtAuthGuard
- [ ] Proteção de rotas
```

**Arquivo**: `src/infra/auth/current-user.decorator.ts`
```typescript
- [ ] Criar decorator @CurrentUser()
- [ ] Extrair usuário do request
```

**Arquivo**: `src/infra/auth/auth.module.ts`
```typescript
- [ ] Configurar JwtModule
- [ ] Registrar strategies e guards
```

### 4.5 HTTP Module Principal

**Arquivo**: `src/infra/http/http.module.ts`
```typescript
- [ ] Importar controllers
- [ ] Importar DatabaseModule
- [ ] Importar ProvidersModule
- [ ] Importar CryptographyModule
- [ ] Importar AuthModule
```

---

## 🚧 Fase 5: Testes (3-4 dias)

### 5.1 Factories

**Arquivo**: `test/factories/make-user.ts`
```typescript
- [ ] makeUser(override?: Partial<UserProps>)
```

**Arquivo**: `test/factories/make-correction.ts`
```typescript
- [ ] makeCorrection(override?: Partial<CorrectionProps>)
```

### 5.2 In-Memory Repositories

**Arquivo**: `test/repositories/in-memory-user-repository.ts`
```typescript
- [ ] InMemoryUserRepository
- [ ] Implementar interface UserRepository
```

**Arquivo**: `test/repositories/in-memory-correction-repository.ts`
```typescript
- [ ] InMemoryCorrectionRepository
- [ ] Implementar countByUserIdInCurrentMonth com lógica de data
```

### 5.3 Fake Providers

**Arquivo**: `test/providers/fake-ai-provider.ts`
```typescript
- [ ] FakeAIProvider
- [ ] Retornar correções mock
```

### 5.4 Testes Unitários (Use Cases)

**Arquivo**: `src/domain/application/use-cases/auth/register-user.spec.ts`
```typescript
- [ ] Deve criar um usuário
- [ ] Não deve criar usuário com email duplicado
- [ ] Deve fazer hash da senha
```

**Arquivo**: `src/domain/application/use-cases/auth/authenticate-user.spec.ts`
```typescript
- [ ] Deve autenticar com credenciais válidas
- [ ] Não deve autenticar com senha errada
- [ ] Não deve autenticar com email inexistente
- [ ] Deve retornar access token
```

**Arquivo**: `src/domain/application/use-cases/corrections/correct-text.spec.ts`
```typescript
- [ ] Deve corrigir texto
- [ ] Deve salvar no repositório
- [ ] Não deve corrigir se usuário não existir
- [ ] Não deve corrigir se limite mensal excedido (FREE plan)
- [ ] Deve permitir correção ilimitada (PRO/BUSINESS)
```

### 5.5 Testes E2E (End-to-End)

**Instalação:**
```bash
pnpm add -D supertest @types/supertest
```

**Arquivo**: `test/auth.e2e-spec.ts`
```typescript
- [ ] POST /auth/register (deve criar usuário)
- [ ] POST /auth/login (deve retornar token)
- [ ] GET /auth/me (deve retornar usuário autenticado)
```

**Arquivo**: `test/corrections.e2e-spec.ts`
```typescript
- [ ] POST /corrections (deve corrigir texto)
- [ ] POST /corrections sem auth (deve retornar 401)
- [ ] POST /corrections com limite excedido (deve retornar 403)
- [ ] GET /corrections (deve listar histórico)
```

---

## 🚧 Fase 6: Rate Limiting & Segurança (1-2 dias)

### 6.1 Rate Limiting por Plano

**Arquivo**: `src/infra/http/guards/rate-limit.guard.ts`
```typescript
- [ ] Criar RateLimitGuard
- [ ] FREE: 50/mês
- [ ] PRO: ilimitado
- [ ] BUSINESS: ilimitado
```

**Instalação:**
```bash
pnpm add @nestjs/throttler
```

### 6.2 Validação de Input

```typescript
- [ ] ValidationPipe global
- [ ] Sanitização de HTML (evitar XSS)
- [ ] Limite de tamanho de texto (max 5000 chars)
```

### 6.3 CORS

**Arquivo**: `src/main.ts`
```typescript
- [ ] Configurar CORS
- [ ] Permitir apenas desktop app origin
```

### 6.4 Helmet (Security Headers)

**Instalação:**
```bash
pnpm add helmet
```

```typescript
- [ ] Adicionar Helmet middleware
```

---

## 🚧 Fase 7: Logging & Monitoring (1 dia)

### 7.1 Logger

**Instalação:**
```bash
pnpm add pino pino-http pino-pretty
pnpm add -D @types/pino
```

**Arquivo**: `src/infra/logger/logger.service.ts`
```typescript
- [ ] Criar LoggerService com Pino
- [ ] Log de requests
- [ ] Log de erros
```

### 7.2 Exception Filters

**Arquivo**: `src/infra/http/filters/http-exception.filter.ts`
```typescript
- [ ] Criar AllExceptionsFilter
- [ ] Formatar erros consistentemente
- [ ] Logar erros 500
```

---

## 🚧 Fase 8: Database & Migrations (1 dia)

### 8.1 Migrations

```bash
- [ ] Configurar PostgreSQL local ou cloud
- [ ] Criar .env com DATABASE_URL
- [ ] pnpm prisma migrate dev --name init
- [ ] pnpm prisma generate
```

### 8.2 Seeds (Dados de Teste)

**Arquivo**: `prisma/seed.ts`
```typescript
- [ ] Criar usuários de teste
- [ ] Criar correções de exemplo
```

**package.json:**
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

---

## 🚧 Fase 9: Documentação API (0.5 dia)

### 9.1 Swagger

**Instalação:**
```bash
pnpm add @nestjs/swagger
```

**Arquivo**: `src/main.ts`
```typescript
- [ ] Configurar Swagger
- [ ] Documentar endpoints
- [ ] Exemplos de request/response
```

**Acesso**: `http://localhost:3000/api/docs`

---

## 🚧 Fase 10: Deploy & CI/CD (1-2 dias)

### 10.1 Docker

**Arquivo**: `Dockerfile`
```dockerfile
- [ ] Multi-stage build
- [ ] Node Alpine base
- [ ] Prisma generate no build
```

**Arquivo**: `docker-compose.yml`
```yaml
- [ ] PostgreSQL service
- [ ] Redis service
- [ ] Backend service
```

### 10.2 CI/CD (GitHub Actions)

**Arquivo**: `.github/workflows/test.yml`
```yaml
- [ ] Rodar testes em PR
- [ ] Lint
- [ ] Type check
```

**Arquivo**: `.github/workflows/deploy.yml`
```yaml
- [ ] Build Docker image
- [ ] Deploy para Railway/Render
```

### 10.3 Deploy

**Opções:**
- [ ] Railway (recomendado, simples)
- [ ] Render
- [ ] Fly.io
- [ ] AWS/Digital Ocean

**Configurações:**
```bash
- [ ] Configurar variáveis de ambiente
- [ ] DATABASE_URL (PostgreSQL)
- [ ] JWT_SECRET
- [ ] OPENAI_API_KEY
```

---

## 🚧 Fase 11: Features Adicionais (Opcional, 2-3 dias)

### 11.1 Subscriptions (Billing com Stripe)

**Instalação:**
```bash
pnpm add stripe
```

**Arquivos:**
```typescript
- [ ] src/infra/billing/stripe.service.ts
- [ ] src/infra/http/controllers/subscriptions.controller.ts
- [ ] POST /subscriptions/checkout
- [ ] POST /subscriptions/webhook (Stripe events)
- [ ] GET /subscriptions/portal
```

### 11.2 Analytics

**Arquivo**: `src/domain/enterprise/entities/analytics.ts`
```typescript
- [ ] Entidade Analytics
- [ ] Eventos: correction_created, login, etc
```

**Controller:**
```typescript
- [ ] GET /analytics/usage (uso mensal)
- [ ] GET /analytics/stats (estatísticas)
```

### 11.3 User Settings

**Controller:**
```typescript
- [ ] PATCH /users/me (atualizar nome, preferências)
- [ ] DELETE /users/me (deletar conta)
```

### 11.4 Forgot Password

**Use Cases:**
```typescript
- [ ] ForgotPasswordUseCase
- [ ] ResetPasswordUseCase
```

**Provider:**
```typescript
- [ ] MailProvider (Resend/SendGrid)
```

**Endpoints:**
```typescript
- [ ] POST /auth/forgot-password
- [ ] POST /auth/reset-password
```

---

## 📊 Resumo de Tempo Estimado

| Fase | Descrição | Tempo |
|------|-----------|-------|
| ✅ 1 | Estrutura Base | **CONCLUÍDO** |
| 2 | Repositórios Prisma | 1-2 dias |
| 3 | Providers (OpenAI) | 2-3 dias |
| 4 | HTTP Layer | 3-4 dias |
| 5 | Testes | 3-4 dias |
| 6 | Rate Limiting & Segurança | 1-2 dias |
| 7 | Logging & Monitoring | 1 dia |
| 8 | Database & Migrations | 1 dia |
| 9 | Documentação Swagger | 0.5 dia |
| 10 | Deploy & CI/CD | 1-2 dias |
| 11 | Features Adicionais | 2-3 dias (opcional) |

**Total MVP**: ~14-20 dias (2-3 semanas)
**Total com Features Adicionais**: ~16-23 dias

---

## 🎯 Prioridade de Implementação (MVP)

### Sprint 1 (Semana 1)
1. ✅ Estrutura DDD
2. **Repositórios Prisma** ← PRÓXIMO
3. **OpenAI Provider**
4. **Controllers básicos** (auth, corrections)
5. **JWT Auth**

### Sprint 2 (Semana 2)
6. **Testes unitários** (use cases)
7. **Testes E2E**
8. **Rate limiting**
9. **Database migrations**
10. **Deploy básico**

### Sprint 3 (Semana 3 - Opcional)
11. Stripe billing
12. Analytics
13. Forgot password
14. Swagger completo

---

## 🚀 Próximo Passo Imediato

**Implementar Repositórios Prisma:**

```bash
# 1. Criar PrismaService
src/infra/database/prisma/prisma.service.ts

# 2. Criar Mappers
src/infra/database/prisma/mappers/prisma-user-mapper.ts
src/infra/database/prisma/mappers/prisma-correction-mapper.ts

# 3. Criar Repositories
src/infra/database/prisma/repositories/prisma-user-repository.ts
src/infra/database/prisma/repositories/prisma-correction-repository.ts

# 4. Criar DatabaseModule
src/infra/database/database.module.ts
```

Quer que eu implemente os repositórios Prisma agora?
