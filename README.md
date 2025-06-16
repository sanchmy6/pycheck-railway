# PyCheck

# System requirements

- Node
- MySQL
- Docker (with Docker compose)

Check the `package.json` for the exact versions

# Structure

1. [Local Setup](#local-setup)
2. [Development](#development)
3. [Production Setup with Docker](#production-setup-with-docker)

# Local Setup:

## 1. Configuration

- Copy the configuration template:

```bash
cp .env.template .env
```

## 2. Setup

- Ensure that the `.env` is configured then run:

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

# Development

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

# Production Setup with Docker:

## 1. Configuration

- Copy the configuration template and adjust the `MYSQL_HOST` variable and set it to `mysql_db`:

```bash
cp .env.template .env
```

Adjust all other environment variables as needed. For full functionality, it is required to adjust and set **all** variables.

## 2. Run Docker

- Use this command every time you need to start your containers
- Don't forget to run it from the main folder of your app

```bash
docker compose up --build
```

## 3. Edit database

- Using your Docker Desktop client, go into the database container, tab "exec"

```bash
mysql -h 127.0.0.1 -u root -proot
```

- In the mysql console that appears:

```bash
GRANT ALL PRIVILEGES ON *.* TO username@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

The privileges are required to create a prisma shadow DB

## 4. Restart Docker

- Stop the container. Typically, Ctrl+C in a default terminal.
- Again, use this command every time you need to stop the container

```bash
docker compose down --remove-orphans
```

- Then start the container as usual (step 3)

## 5. Enable watch(optional)

- Watch allows automatic rebuilds upon changing your source code
- Alternatively, you can just restart your setup using Step 4 and then Step 2.
- open a different console and use this command:

```bash
docker compose watch
```
