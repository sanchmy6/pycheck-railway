# Start your image with a node base image
FROM node:18-alpine

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the app package and package-lock.json file
COPY package*.json ./
COPY ./.env.template ./
COPY ./next.config.ts ./
COPY ./postcss.config.mjs ./
COPY ./tsconfig.json ./
COPY ./entrypoint.sh ./

# Copy local directories to the current local directory of our docker image (/app)
COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma

RUN rm -rf ./.next
# Install node packages, install serve, build the app, and remove dependencies at the end
RUN cp .env.template .env 


RUN npm install \
    # && npm install -g serve \
    && npm run build 
    # && rm -fr node_modules

EXPOSE 3000


# Start the app using serve command
CMD ["npm", "start"]
# CMD ["npx", "prisma", "generate", "&&", "npx", "prisma", "migrate", "dev", "&&", "npm", "start"]
# RUN npx prisma migrate dev"npm", "start"]