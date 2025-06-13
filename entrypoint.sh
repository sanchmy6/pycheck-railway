# Entry point for docker-compose.
# Since Dockerfile itself only has build instructions, and the database is not necessarily available at build time,
# we need to run the migration code here. Here, it is called every time the container starts.

npx prisma generate
npx prisma migrate dev
npm start