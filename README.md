PyCheck

## Description

## System requirements

- Node
- MySQL

## 1. Configuration

- Copy the configuration template:

```bash
cp .env.template .env
```

## 2. Setup

- Ensure that the `.env` is configured

```bash
npm install
```

### Database Setup

1. Generate the prisma client

```bash
npx prisma generate
```

2. Run the database migrations

```bash
npx prisma migrate dev
```

3. (optional) Seed the database

```bash
npm run seed
```

## 3. Startup

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
