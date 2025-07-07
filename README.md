# PyCheck

PyCheck is a web application built with next.js and MySQL that provides an interactive learning experience for students to prepare for exam tasks.

## System Requirements

- [Node.js](https://nodejs.org/) (18.x or higher)
- [MySQL](https://www.mysql.com/) (8.3 or higher)
- [Docker](https://www.docker.com/) (24.x or higher) with Docker Compose (v2.x or higher)

## Quick Start

1. [Local Setup](#local-setup)
2. [Development](#development)
3. [Production Setup with Docker](#production-setup-with-docker)

## Local Setup

### 1. Configuration

Copy the configuration template:

```bash
cp .env.template .env
```

Edit the `.env` file and configure all required environment variables.

### 2. Setup

Install dependencies:

```bash
npm install
```

#### Database Setup

1. Generate the Prisma client:

```bash
npx prisma generate
```

2. Run the database migrations:

```bash
npx prisma migrate dev
```

3. (Optional) Seed the database:

```bash
npm run seed
```

### 3. Startup

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

### Database

PyCheck uses [Prisma](https://www.prisma.io/) as its database toolkit and ORM (Object-Relational Mapping). Prisma provides type-safe database access, automatic migrations, and an intuitive data modeling language that makes database development both productive and reliable.

#### Database Schema Development

To add new models or modify existing ones in the database:

1. **Update the schema**: Edit the `schema.prisma` file located in the `prisma/` directory to define your data models, relationships, and database structure.

2. **Create a migration**: Generate a new migration file that captures your schema changes and can be applied to update the database structure.

Create a new migration:

```bash
npx prisma migrate dev --name <your_migration_name>
```

3. **Apply the migration**: Deploy your changes to the database.

Apply the migration:

```bash
npx prisma migrate dev
```

4. **Regenerate the client**: After schema changes, regenerate the Prisma client to get updated TypeScript types and database access methods:

```bash
npx prisma generate
```

#### Additional Database Operations

- **View your data**: Use Prisma Studio to browse and edit your data in a web-based GUI:

  ```bash
  npx prisma studio
  ```

- **Reset the database**: If you need to reset your development database:

  ```bash
  npx prisma migrate reset
  ```

- **Deploy to production**: For production environments, use:
  ```bash
  npx prisma migrate deploy
  ```

For more advanced database operations and best practices, refer to the [Prisma documentation](https://www.prisma.io/docs/).

## Production Setup with Docker

### 1. Configuration

Copy the configuration template and adjust the `MYSQL_HOST` variable to `mysql_db`:

```bash
cp .env.template .env
```

Edit the `.env` file and configure all environment variables. For full functionality, it is required to adjust and set **all** variables.

### 2. Run Docker

Start the containers (run this command from the project root directory):

```bash
docker compose up --build
```

### 3. Configure Database Permissions

#### Option A: Using Terminal

First, find the MySQL container name:

```bash
docker ps
```

Look for the container running MySQL (usually named something like `pycheck-mysql_db-1` or similar).

Access the MySQL container:

```bash
docker exec -it <mysql_container_name> mysql -u root -proot
```

Alternatively, if you know the exact container name from your docker-compose.yml:

```bash
docker exec -it pycheck-mysql_db-1 mysql -u root -proot
```

#### Option B: Using Docker Desktop

Open Docker Desktop, navigate to the database container, and open the "exec" tab.

Connect to MySQL:

```bash
mysql -h 127.0.0.1 -u root -proot
```

#### Execute Database Commands

Once connected to MySQL (using either option above), execute:

```bash
GRANT ALL PRIVILEGES ON *.* TO username@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

These privileges are required to create a Prisma shadow database.

### 4. Restart Docker

Stop the containers (typically Ctrl+C in the terminal):

```bash
docker compose down --remove-orphans
```

Then restart using step 2.

### 5. Enable Watch (Optional)

Watch mode enables automatic rebuilds when source code changes. Alternatively, you can manually restart using steps 4 and 2.

In a separate terminal, run:

```bash
docker compose watch
```

## Credits

### Core Contributors

- **[cankoeks](https://github.com/cankoeks)**
- **[Buhaiev](https://github.com/Buhaiev)**
- **[OlhaBorysova](https://github.com/OlhaBorysova)**
