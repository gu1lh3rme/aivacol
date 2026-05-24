# Aivacol - Plataforma de Gestao de Frota

Projeto full stack com frontend em Angular 19 e backend em NestJS 11 para gestao de veiculos.

## Estrutura

```text
/aivacol/
|- backend/                # API NestJS
|- frontend/               # Aplicacao Angular
|- seed_vehicles.json      # Base inicial de veiculos
|- docker-compose.yml      # SQL Server + Redis + backend + frontend
`- README.md
```

## Stack

### Frontend
- Angular 19 (standalone)
- Signals + RxJS
- Angular Material
- Interceptor JWT com refresh automatico

### Backend
- NestJS 11
- TypeORM + SQL Server
- JWT (access + refresh)
- Cache em memoria ou Redis
- Swagger em `/docs`

## Pre-requisitos

- Node.js 20+
- npm 10+
- SQL Server disponivel (local ou Docker)
- Docker + Docker Compose (opcional, para stack conteinerizada)

## Configuracao do Backend

1. Entre na pasta do backend.
2. Crie o arquivo `.env` a partir do exemplo.
3. Ajuste os valores de banco e credenciais conforme seu ambiente.

PowerShell (Windows):

```powershell
cd backend
Copy-Item .env.example .env
```

Exemplo de `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
# Opcional. Deixe vazio quando conectar por porta TCP fixa.
DB_INSTANCE=
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=admin
DB_DATABASE=aivacol
JWT_SECRET=access_secret
JWT_REFRESH_SECRET=refresh_secret
AUTH_EMAIL=admin@aivacol.com
AUTH_PASSWORD=aivacol@123
AUTH_NICKNAME=admin
AUTH_NAME=Administrador Aivacol
CACHE_DRIVER=memory
# Usado apenas quando CACHE_DRIVER=redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Execucao Local (Recomendado para desenvolvimento)

### 1) Subir o backend

```bash
cd backend
npm install
npm run start:dev
```

Backend disponivel em:
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

### 2) Subir o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm start
```

Frontend disponivel em:
- App: http://localhost:4200

## Execucao com Docker Compose (stack completa)

Na raiz do projeto:

```bash
docker compose up --build
```

Servicos:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- SQL Server: localhost:1433
- Redis: localhost:6379

Observacao importante sobre seed no Docker:
- O backend procura o arquivo de seed em `/seed_vehicles.json`.
- No `docker-compose.yml` atual, esse arquivo nao esta montado no container do backend.
- Para garantir seed automatica via Docker, adicione no servico `backend`:

```yaml
volumes:
  - ./seed_vehicles.json:/seed_vehicles.json:ro
```

## Como funciona o Seed

O seed e executado automaticamente na inicializacao do backend (via `SeedService`).

Regras:
- Usuario inicial: so e criado se a tabela de usuarios estiver vazia.
- Veiculos/marcas/modelos: so sao importados se a tabela de veiculos estiver vazia.
- Fonte dos dados: arquivo `seed_vehicles.json` na raiz do projeto.

Credenciais padrao do usuario inicial:
- Email: `admin@aivacol.com`
- Senha: `aivacol@123`

Importante:
- O seed e idempotente no primeiro nivel: se ja houver registros, ele nao reinsere dados.
- Para reexecutar seed completo, limpe as tabelas (ou recrie o banco) e reinicie o backend.

## Testes e Qualidade

Backend:

```bash
cd backend
npm run lint
npm run test
npm run test:e2e
npm run build
```

Frontend:

```bash
cd frontend
npm run build
npm run test -- --watch=false --browsers=ChromeHeadless
```

## Endpoints de autenticacao

- `POST /auth/login`
- `POST /auth/refresh`

As demais rotas de negocio exigem token JWT.
