# Roadmap de Features - Backend Habbit

## 📋 Visão Geral das Features

O backend do Habbit terá as seguintes funcionalidades principais:

1. **Autenticação & Autorização**
2. **Correção de Texto (IA)**
3. **Gerenciamento de Usuários**
4. **Sistema de Planos & Billing**
5. **Histórico & Analytics**
6. **Gerenciamento de Preferências**

---

## 🔐 1. Autenticação & Autorização

### 1.1 Registro de Usuário
**Endpoint**: `POST /auth/register`

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "João Silva"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "plan": "FREE",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Regras:**
- ✅ Email único (não pode duplicar)
- ✅ Senha mínima de 6 caracteres
- ✅ Hash da senha com bcrypt
- ✅ Plano inicial: FREE

---

### 1.2 Login (Autenticação)
**Endpoint**: `POST /auth/login`

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "plan": "FREE"
  }
}
```

**Regras:**
- ✅ Validar email e senha
- ✅ Comparar hash da senha
- ✅ Gerar JWT token com payload: `{ sub: userId, plan: userPlan }`
- ✅ Token expira em 7 dias

---

### 1.3 Obter Usuário Atual
**Endpoint**: `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "plan": "PRO",
    "monthlyUsage": 127,
    "monthlyLimit": "unlimited",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Regras:**
- ✅ Requer autenticação (JWT)
- ✅ Retorna dados do usuário logado
- ✅ Incluir uso mensal de correções

---

### 1.4 Esqueci Minha Senha
**Endpoint**: `POST /auth/forgot-password`

**Request:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Response:**
```json
{
  "message": "Email de recuperação enviado"
}
```

**Regras:**
- ✅ Gerar token único com expiração de 30 minutos
- ✅ Enviar email com link de reset
- ✅ Link: `https://app.habbit.com/reset-password?token=xxx`

---

### 1.5 Resetar Senha
**Endpoint**: `POST /auth/reset-password`

**Request:**
```json
{
  "token": "reset-token-uuid",
  "newPassword": "novaSenha123",
  "confirmPassword": "novaSenha123"
}
```

**Response:**
```json
{
  "message": "Senha atualizada com sucesso"
}
```

**Regras:**
- ✅ Validar token não expirado
- ✅ Validar senha de confirmação
- ✅ Hash da nova senha
- ✅ Invalidar token após uso

---

### 1.6 Logout (Desktop)
**Endpoint**: `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Logout realizado"
}
```

**Regras:**
- ✅ Invalidar token (blacklist em Redis)
- ✅ Desktop app apaga token local

---

## ✍️ 2. Correção de Texto (Core Feature)

### 2.1 Corrigir Texto
**Endpoint**: `POST /corrections`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "text": "Eu fui no mercado ontem e comprei varias coisas.",
  "language": "pt"
}
```

**Response:**
```json
{
  "correction": {
    "id": "uuid",
    "originalText": "Eu fui no mercado ontem e comprei varias coisas.",
    "correctedText": "Eu fui ao mercado ontem e comprei várias coisas.",
    "changes": [
      {
        "type": "grammar",
        "original": "fui no",
        "corrected": "fui ao",
        "explanation": "Regência verbal correta"
      },
      {
        "type": "spelling",
        "original": "varias",
        "corrected": "várias",
        "explanation": "Acentuação necessária"
      }
    ],
    "language": "pt",
    "tokensUsed": 45,
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "usage": {
    "monthly": 28,
    "limit": 50,
    "remaining": 22
  }
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Validar limite mensal do plano:
  - FREE: 50/mês
  - PRO: ilimitado
  - BUSINESS: ilimitado
- ✅ Texto máximo: 5000 caracteres
- ✅ Idiomas suportados: `pt`, `en`, `es`
- ✅ Salvar no histórico
- ✅ Retornar uso mensal atualizado

**Integração com IA (OpenAI):**
```typescript
// Prompt otimizado
const prompt = `
Você é um assistente de correção de texto.
Corrija o seguinte texto em ${language}:
- Gramática
- Ortografia
- Pontuação
- Coerência

Texto original:
${text}

Retorne APENAS o texto corrigido, sem explicações.
`
```

---

### 2.2 Obter Histórico de Correções
**Endpoint**: `GET /corrections?page=1&perPage=20`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "corrections": [
    {
      "id": "uuid",
      "originalText": "texto original...",
      "correctedText": "texto corrigido...",
      "language": "pt",
      "tokensUsed": 45,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 127,
    "totalPages": 7
  }
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Paginação (default: 20 por página)
- ✅ Ordenar por mais recente primeiro
- ✅ Filtrar apenas correções do usuário logado

---

### 2.3 Estatísticas de Uso
**Endpoint**: `GET /corrections/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "currentMonth": {
    "corrections": 28,
    "limit": 50,
    "remaining": 22,
    "tokensUsed": 1240
  },
  "allTime": {
    "totalCorrections": 347,
    "totalTokens": 15620,
    "averagePerMonth": 58
  },
  "lastCorrections": [
    {
      "id": "uuid",
      "text": "...",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Calcular uso do mês atual
- ✅ Estatísticas totais
- ✅ Últimas 5 correções

---

### 2.4 Cache de Correções (Redis)
**Funcionalidade interna (não é endpoint)**

**Lógica:**
```typescript
// Antes de chamar OpenAI
const cacheKey = `correction:${hash(text + language)}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached) // Retorna instantaneamente
}

// Se não estiver em cache, chama OpenAI
const result = await openai.correct(text, language)

// Salva no cache por 24h
await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400)
```

**Benefícios:**
- ⚡ Correções instantâneas para textos repetidos
- 💰 Economia de chamadas à OpenAI
- 🚀 Melhor UX

---

## 👤 3. Gerenciamento de Usuários

### 3.1 Atualizar Perfil
**Endpoint**: `PATCH /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "João Silva Santos",
  "preferences": {
    "defaultLanguage": "pt",
    "autoCorrect": true,
    "notifications": true
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva Santos",
    "preferences": {
      "defaultLanguage": "pt",
      "autoCorrect": true,
      "notifications": true
    }
  }
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Não pode alterar email (requer endpoint separado)
- ✅ Validar preferências

---

### 3.2 Alterar Email
**Endpoint**: `POST /users/change-email`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "newEmail": "novoemail@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Email de confirmação enviado para novoemail@exemplo.com"
}
```

**Regras:**
- ✅ Validar senha atual
- ✅ Verificar novo email não está em uso
- ✅ Enviar email de confirmação
- ✅ Alterar email após confirmação

---

### 3.3 Alterar Senha
**Endpoint**: `POST /users/change-password`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456",
  "confirmPassword": "novaSenha456"
}
```

**Response:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Regras:**
- ✅ Validar senha atual
- ✅ Validar confirmação de senha
- ✅ Hash da nova senha
- ✅ Invalidar tokens antigos

---

### 3.4 Deletar Conta
**Endpoint**: `DELETE /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "password": "senha123",
  "confirmation": "DELETE"
}
```

**Response:**
```json
{
  "message": "Conta deletada com sucesso"
}
```

**Regras:**
- ✅ Validar senha
- ✅ Requerer confirmação explícita
- ✅ Cancelar assinatura (se houver)
- ✅ Soft delete (marcar como deletado, não apagar dados)
- ✅ Anonimizar dados após 30 dias

---

## 💳 4. Sistema de Planos & Billing (Stripe)

### 4.1 Criar Checkout Session
**Endpoint**: `POST /subscriptions/checkout`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "plan": "PRO"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Criar Stripe Customer (se não existir)
- ✅ Criar Checkout Session
- ✅ Redirecionar para Stripe
- ✅ Webhook recebe confirmação de pagamento

---

### 4.2 Webhook do Stripe
**Endpoint**: `POST /subscriptions/webhook`

**Headers:**
```
stripe-signature: xxx
```

**Eventos tratados:**
```typescript
- checkout.session.completed → Ativar assinatura
- customer.subscription.updated → Atualizar plano
- customer.subscription.deleted → Cancelar assinatura
- invoice.payment_succeeded → Renovação bem-sucedida
- invoice.payment_failed → Pagamento falhou
```

**Regras:**
- ✅ Validar assinatura do Stripe
- ✅ Processar eventos de forma idempotente
- ✅ Atualizar plano do usuário
- ✅ Enviar emails de confirmação

---

### 4.3 Portal de Gerenciamento
**Endpoint**: `POST /subscriptions/portal`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "portalUrl": "https://billing.stripe.com/session/xxx"
}
```

**Regras:**
- ✅ Criar Stripe Billing Portal Session
- ✅ Usuário pode:
  - Cancelar assinatura
  - Atualizar cartão
  - Ver faturas
  - Fazer upgrade/downgrade

---

### 4.4 Obter Status da Assinatura
**Endpoint**: `GET /subscriptions/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "subscription": {
    "plan": "PRO",
    "status": "active",
    "currentPeriodEnd": "2025-02-15T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "price": 9.90
  }
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Retornar dados da assinatura Stripe
- ✅ Se FREE, retornar null

---

## 📊 5. Analytics & Logs

### 5.1 Registrar Evento de Analytics
**Funcionalidade interna (não é endpoint público)**

**Eventos rastreados:**
```typescript
- user_registered
- user_logged_in
- correction_created
- subscription_created
- subscription_canceled
- app_opened (desktop)
- app_closed (desktop)
```

**Modelo:**
```typescript
{
  userId: string
  event: string
  metadata: {
    platform: 'desktop' | 'web'
    version: '1.0.0'
    // dados específicos do evento
  }
  createdAt: Date
}
```

---

### 5.2 Obter Analytics do Usuário
**Endpoint**: `GET /analytics/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "usage": {
    "totalCorrections": 347,
    "monthlyAverage": 58,
    "favoriteLanguage": "pt",
    "totalTokens": 15620
  },
  "timeline": [
    {
      "date": "2025-01-15",
      "corrections": 12,
      "tokens": 540
    }
  ]
}
```

**Regras:**
- ✅ Requer autenticação
- ✅ Apenas dados do próprio usuário
- ✅ Timeline dos últimos 30 dias

---

## ⚙️ 6. Configurações & Preferências

### 6.1 Obter Configurações
**Endpoint**: `GET /settings`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "settings": {
    "defaultLanguage": "pt",
    "autoCorrect": true,
    "notifications": {
      "email": true,
      "desktop": true
    },
    "shortcuts": {
      "correct": "Ctrl+/",
      "quickCorrect": "Ctrl+Shift+/"
    },
    "appearance": {
      "theme": "dark"
    }
  }
}
```

---

### 6.2 Atualizar Configurações
**Endpoint**: `PATCH /settings`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "defaultLanguage": "en",
  "autoCorrect": false,
  "shortcuts": {
    "correct": "Ctrl+."
  }
}
```

**Response:**
```json
{
  "settings": {
    "defaultLanguage": "en",
    "autoCorrect": false,
    "shortcuts": {
      "correct": "Ctrl+."
    }
  }
}
```

---

## 🔧 7. Endpoints Administrativos (Futuro)

### 7.1 Listar Todos os Usuários (Admin)
**Endpoint**: `GET /admin/users`

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Regras:**
- ✅ Requer role ADMIN
- ✅ Paginação
- ✅ Filtros (plan, status)

---

### 7.2 Dashboard de Métricas (Admin)
**Endpoint**: `GET /admin/metrics`

**Response:**
```json
{
  "users": {
    "total": 1247,
    "active": 893,
    "byPlan": {
      "FREE": 1000,
      "PRO": 200,
      "BUSINESS": 47
    }
  },
  "corrections": {
    "today": 2340,
    "thisMonth": 67890,
    "allTime": 1234567
  },
  "revenue": {
    "mrr": 4500.00,
    "churn": 3.2
  }
}
```

---

## 📦 Resumo de Todos os Endpoints

### Autenticação
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/me` - Usuário atual
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Esqueci senha
- `POST /auth/reset-password` - Resetar senha

### Correções
- `POST /corrections` - Corrigir texto ⭐ **CORE**
- `GET /corrections` - Histórico
- `GET /corrections/stats` - Estatísticas

### Usuários
- `PATCH /users/me` - Atualizar perfil
- `POST /users/change-email` - Alterar email
- `POST /users/change-password` - Alterar senha
- `DELETE /users/me` - Deletar conta

### Assinaturas
- `POST /subscriptions/checkout` - Iniciar checkout
- `POST /subscriptions/webhook` - Webhook Stripe
- `POST /subscriptions/portal` - Portal de billing
- `GET /subscriptions/status` - Status da assinatura

### Analytics
- `GET /analytics/me` - Analytics do usuário

### Configurações
- `GET /settings` - Obter configurações
- `PATCH /settings` - Atualizar configurações

### Admin (Futuro)
- `GET /admin/users` - Listar usuários
- `GET /admin/metrics` - Métricas do sistema

---

## 🎯 Ordem de Implementação Sugerida

### Sprint 1 (MVP Básico)
1. ✅ Estrutura DDD
2. ✅ Entidades e Use Cases
3. **POST /auth/register**
4. **POST /auth/login**
5. **GET /auth/me**
6. **POST /corrections** (sem cache ainda)
7. **GET /corrections/stats**

### Sprint 2 (Melhorias)
8. **GET /corrections** (histórico paginado)
9. **Cache Redis** (correções repetidas)
10. **PATCH /users/me**
11. **POST /auth/forgot-password**
12. **POST /auth/reset-password**

### Sprint 3 (Billing)
13. **POST /subscriptions/checkout**
14. **POST /subscriptions/webhook**
15. **POST /subscriptions/portal**
16. **GET /subscriptions/status**

### Sprint 4 (Analytics & Polish)
17. **GET /analytics/me**
18. **GET /settings**
19. **PATCH /settings**
20. **Testes E2E completos**
21. **Documentação Swagger**

---

## 🚀 Tecnologias Necessárias

### Já Instaladas
- ✅ NestJS
- ✅ Prisma
- ✅ JWT
- ✅ Bcrypt
- ✅ Zod

### A Instalar
```bash
# OpenAI
pnpm add openai

# Redis (cache)
pnpm add ioredis
pnpm add -D @types/ioredis

# Stripe
pnpm add stripe

# Email (Resend)
pnpm add resend

# Swagger
pnpm add @nestjs/swagger

# Rate Limiting
pnpm add @nestjs/throttler
```

---

Quer que eu comece a implementar esses endpoints agora?
