PyCheck

# Description

# System requirements

- Node
- MySQL
- Docker (with Docker compose)

# Launch with Docker:

## 1. Configuration

- Copy the configuration template:

```bash
cp .env.template .env
```

## 2. Run Docker

- Use this command every time you need to start your containers
- Don't forget to run it from the main folder of your app

```bash
docker compose up --build
```

## 3. Edit database

- Using your Docker Desktop client, go into the database container, tab "exec"

```bash
mysql -h 127.0.0.1 -u root -proot #the spaces are right already
```

- In the mysql console that appears:

```bash
GRANT ALL PRIVILEGES ON *.* TO username@'%' WITH GRANT OPTION; #these privileges are necessary to create a prisma shadow DB
FLUSH PRIVILEGES;
```

## 4. Restart Docker

- First, use Ctrl+C to stop the docker compose up process.
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

# Local launch:

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
