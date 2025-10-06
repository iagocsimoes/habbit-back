# Estrutura DDD do Backend Habbit

## Estrutura de Pastas Criada

```
backend/
├── src/
│   ├── core/                           # Abstrações e lógica reutilizável
│   │   ├── entities/
│   │   │   ├── entity.ts               # Classe base para entidades
│   │   │   ├── aggregate-root.ts       # Base para agregados
│   │   │   └── unique-entity-id.ts     # Value Object para IDs
│   │   ├── errors/
│   │   │   └── use-case-error.ts       # Interface para erros
│   │   └── types/
│   │       └── either.ts               # Either monad (Left/Right)
│   │
│   ├── domain/                         # Camada de Domínio
│   │   ├── enterprise/
│   │   │   └── entities/               # Entidades de negócio
│   │   │       ├── user.ts             # Agregado User
│   │   │       └── correction.ts       # Entidade Correction
│   │   │
│   │   └── application/
│   │       ├── repositories/           # Contratos dos repositórios
│   │       │   ├── user-repository.ts
│   │       │   └── correction-repository.ts
│   │       │
│   │       ├── cryptography/           # Abstrações de criptografia
│   │       │   ├── hash-generator.ts
│   │       │   ├── hash-comparer.ts
│   │       │   └── encrypter.ts
│   │       │
│   │       ├── providers/              # Contratos de serviços externos
│   │       │   └── ai-provider.ts
│   │       │
│   │       └── use-cases/              # Casos de uso (regras de negócio)
│   │           ├── auth/
│   │           │   ├── register-user.ts
│   │           │   ├── authenticate-user.ts
│   │           │   └── errors/
│   │           │       ├── user-already-exists-error.ts
│   │           │       └── wrong-credentials-error.ts
│   │           │
│   │           └── corrections/
│   │               ├── correct-text.ts
│   │               └── errors/
│   │                   ├── resource-not-found-error.ts
│   │                   └── monthly-limit-exceeded-error.ts
│   │
│   └── infra/                          # Camada de Infraestrutura
│       ├── cryptography/               # Implementações de criptografia
│       │   ├── bcrypt-hasher.ts        # Hash com bcrypt
│       │   ├── jwt-encrypter.ts        # JWT
│       │   └── cryptography.module.ts
│       │
│       ├── env/                        # Configuração de ambiente
│       │   ├── env.ts                  # Schema com Zod
│       │   └── env.module.ts
│       │
│       ├── database/
│       │   └── prisma/
│       │       └── repositories/       # Implementações Prisma (TODO)
│       │
│       └── http/                       # Controllers e DTOs (TODO)
│           ├── controllers/
│           └── presenters/
│
├── prisma/
│   └── schema.prisma                   # Schema do banco de dados
│
├── test/                               # Testes
│   ├── factories/                      # Fábricas para testes
│   └── repositories/                   # In-memory repositories
│
└── tsconfig.json                       # Path aliases configurados
```

---

## Conceitos DDD Aplicados

### 1. **Entidades (Entities)**
Objetos com identidade única e ciclo de vida.

- **User** ([src/domain/enterprise/entities/user.ts](src/domain/enterprise/entities/user.ts))
  - Agregado raiz
  - Gerencia email, senha, plano

- **Correction** ([src/domain/enterprise/entities/correction.ts](src/domain/enterprise/entities/correction.ts))
  - Entidade que representa uma correção de texto

### 2. **Value Objects**
Objetos imutáveis definidos por seus atributos.

- **UniqueEntityID** ([src/core/entities/unique-entity-id.ts](src/core/entities/unique-entity-id.ts))
  - Encapsula lógica de IDs únicos

### 3. **Repositórios (Repositories)**
Abstrações para persistência.

- **UserRepository** ([src/domain/application/repositories/user-repository.ts](src/domain/application/repositories/user-repository.ts))
  - Contrato: findById, findByEmail, create, save

- **CorrectionRepository** ([src/domain/application/repositories/correction-repository.ts](src/domain/application/repositories/correction-repository.ts))
  - Contrato: create, findManyByUserId, countByUserIdInCurrentMonth

### 4. **Casos de Uso (Use Cases)**
Orquestram a lógica de negócio.

#### Auth
- **RegisterUserUseCase** ([src/domain/application/use-cases/auth/register-user.ts](src/domain/application/use-cases/auth/register-user.ts))
  - Valida email único
  - Gera hash da senha
  - Cria usuário

- **AuthenticateUserUseCase** ([src/domain/application/use-cases/auth/authenticate-user.ts](src/domain/application/use-cases/auth/authenticate-user.ts))
  - Valida credenciais
  - Compara hash de senha
  - Gera JWT token

#### Corrections
- **CorrectTextUseCase** ([src/domain/application/use-cases/corrections/correct-text.ts](src/domain/application/use-cases/corrections/correct-text.ts))
  - Verifica usuário existe
  - Valida limite mensal do plano
  - Chama IA para correção
  - Salva histórico

### 5. **Providers (Abstrações de Serviços)**
Contratos para serviços externos.

- **AIProvider** ([src/domain/application/providers/ai-provider.ts](src/domain/application/providers/ai-provider.ts))
  - Interface para OpenAI/Claude
  - Método: `correctText(text, language)`

### 6. **Either Monad**
Pattern funcional para tratamento de erros.

```typescript
// Sucesso
return right({ user })

// Erro
return left(new UserAlreadyExistsError(email))
```

---

## Implementações de Infraestrutura

### Cryptography

- **BcryptHasher** ([src/infra/cryptography/bcrypt-hasher.ts](src/infra/cryptography/bcrypt-hasher.ts))
  - Implementa `HashGenerator` e `HashComparer`

- **JwtEncrypter** ([src/infra/cryptography/jwt-encrypter.ts](src/infra/cryptography/jwt-encrypter.ts))
  - Implementa `Encrypter`
  - Usa `@nestjs/jwt`

### Environment

- **Env Schema** ([src/infra/env/env.ts](src/infra/env/env.ts))
  - Validação com Zod
  - Variáveis: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, etc.

---

## Path Aliases Configurados

No [tsconfig.json](tsconfig.json):

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/core/*": ["./src/core/*"],
    "@/domain/*": ["./src/domain/*"],
    "@/infra/*": ["./src/infra/*"],
    "@/test/*": ["./test/*"]
  }
}
```

Agora você pode importar assim:
```typescript
import { User } from '@/domain/enterprise/entities/user'
import { Either } from '@/core/types/either'
```

---

## Próximos Passos

### 1. Implementar Repositórios Prisma
```bash
# Criar em src/infra/database/prisma/repositories/
- prisma-user-repository.ts
- prisma-correction-repository.ts
```

### 2. Implementar AI Provider
```bash
# Criar em src/infra/providers/
- openai-ai-provider.ts
```

### 3. Criar Controllers HTTP
```bash
# Criar em src/infra/http/controllers/
- auth.controller.ts
- corrections.controller.ts
```

### 4. Criar DTOs e Presenters
```bash
# Criar em src/infra/http/
- dtos/ (validação de input)
- presenters/ (formatação de output)
```

### 5. Criar Testes
```bash
# Criar em test/
- factories/make-user.ts
- repositories/in-memory-user-repository.ts
- unit tests para use cases
```

### 6. Configurar Guards e Strategies
```bash
# Criar JWT Strategy e Guards
- src/infra/auth/jwt.strategy.ts
- src/infra/auth/jwt-auth.guard.ts
```

---

## Exemplo de Fluxo Completo

### Registro de Usuário

```
1. HTTP Request → Controller
   POST /auth/register
   { email, password, name }

2. Controller → Use Case
   RegisterUserUseCase.execute()

3. Use Case → Repository (verifica email)
   userRepository.findByEmail()

4. Use Case → HashGenerator
   hashGenerator.hash(password)

5. Use Case → Domain Entity
   User.create({ email, passwordHash, name })

6. Use Case → Repository (salva)
   userRepository.create(user)

7. Use Case → Controller
   return right({ user })

8. Controller → HTTP Response
   201 Created { user: {...} }
```

---

## Benefícios da Arquitetura DDD

✅ **Separação de Responsabilidades**: Domínio isolado de infraestrutura
✅ **Testabilidade**: Use cases testáveis com in-memory repositories
✅ **Manutenibilidade**: Mudanças de infra não afetam domínio
✅ **Type Safety**: TypeScript + Either monad
✅ **Escalabilidade**: Fácil adicionar novos use cases
✅ **Segurança**: Abstrações de crypto, validação de env

---

## Comandos Úteis

```bash
# Gerar Prisma Client
pnpm prisma generate

# Criar migration
pnpm prisma migrate dev --name init

# Rodar backend
pnpm start:dev

# Testes (quando implementados)
pnpm test
pnpm test:e2e
```

---

Estrutura DDD completa criada! 🚀
