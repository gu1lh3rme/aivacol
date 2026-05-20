# Aivacol - Plataforma de Gestão de Frota

Projeto full stack com **frontend Angular 19 (standalone + signals)** e **backend NestJS 11 (TypeORM + JWT + Redis cache)** para gestão de veículos.

## Estrutura

```text
/aivacol/
├── backend/                # API NestJS
├── frontend/               # Aplicação Angular
├── seed_vehicles.json      # Base inicial de veículos
├── docker-compose.yml      # Redis + backend + frontend
└── README.md
```

## Tecnologias

### Frontend
- Angular 19 standalone
- Signals + RxJS
- Angular Router com lazy loading
- HttpClient + interceptor JWT com refresh
- Reactive Forms
- Angular Material

### Backend
- NestJS 11
- TypeORM + SQLite
- JWT (access + refresh)
- Redis (cache de listagem de veículos)
- DTOs com class-validator

## Funcionalidades implementadas

- Login robusto com formulário reativo, loading, erro e remember me
- Guard funcional para rotas privadas
- Interceptor JWT com refresh token automático em `401`
- CRUD de marcas, modelos e veículos
- Rotas protegidas por JWT (exceto `/auth/login` e `/auth/refresh`)
- Listagem de veículos com:
  - tabela responsiva (Material Table)
  - filtros (placa, marca, modelo)
  - paginação
  - loading state e estado vazio
- Cadastro/edição de veículo com:
  - validações fortes
  - dropdown encadeado (marca -> modelo)
  - upload opcional com preview
  - confirmação ao cancelar com alterações
- Seed automática via `seed_vehicles.json`

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- npm 10+
- Redis local (ou Docker)

### 1) Backend

```bash
cd /home/runner/work/aivacol/aivacol/backend
cp .env.example .env
npm install
npm run start:dev
```

API: `http://localhost:3000`

Credenciais padrão:
- email: `admin@aivacol.com`
- senha: `Aivacol@123`

### 2) Frontend

```bash
cd /home/runner/work/aivacol/aivacol/frontend
npm install
npm start
```

App: `http://localhost:4200`

## Variáveis de ambiente

Arquivo: `backend/.env`

```env
PORT=3000
DB_PATH=aivacol.db
JWT_SECRET=access_secret
JWT_REFRESH_SECRET=refresh_secret
AUTH_EMAIL=admin@aivacol.com
AUTH_PASSWORD=Aivacol@123
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Docker (bônus)

```bash
cd /home/runner/work/aivacol/aivacol
docker compose up --build
```

Serviços:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Redis: `localhost:6379`

## Testes e qualidade

Backend:
```bash
cd backend
npm run lint
npm run test
npm run build
```

Frontend:
```bash
cd frontend
npm run build
npm run test -- --watch=false --browsers=ChromeHeadless
```

## Decisões técnicas

- **Angular standalone + signals** para reduzir boilerplate e melhorar reatividade local.
- **State por service + signals** no frontend para simplicidade e boa escalabilidade por feature.
- **JWT com refresh token** no backend e renovação automática no interceptor para UX contínua.
- **Cache Redis** na listagem de veículos para reduzir custo de consultas repetidas.
- **TypeORM com SQLite** para setup rápido local e integração simples com seed.

## Melhorias futuras

- Upload real de imagem (S3/Cloudinary) em vez de base64.
- Testes E2E com Cypress/Playwright.
- Observabilidade (logs estruturados + tracing).
- Paginação e filtros avançados no backend com índices dedicados.
- RBAC com perfis de usuário.
