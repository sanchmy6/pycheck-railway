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

## Database

To add new models to the database you can simply update/extend the `schema.prisma` and create a new migration for your changes.

The command to create a new migration is as follows:

```bash
npx primsa migrate dev --name <your_migration_name>
```

Then afterwards run:

```bash
npx prisma migrate dev
```
