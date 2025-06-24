# Start your image with a node base image
FROM node:18-alpine

# The /app directory should act as the main application directory
WORKDIR /app

#copy settings files to the current local directory of our docker image (/app)
COPY package*.json ./
COPY ./.env.template ./env
COPY ./next.config.ts ./
COPY ./postcss.config.mjs ./
COPY ./tsconfig.json ./
COPY ./entrypoint.sh ./
COPY ./.swrc ./.swrc
COPY ./jest.config.js ./jest.config.js
COPY ./jest.setup.js ./jest.setup.js
# COPY ./babel.config.js ./babel.config.js

# Copy local directories to the current local directory of our docker image (/app)
COPY ./src ./src
COPY ./public ./public
COPY ./prisma ./prisma
COPY ./__tests__ ./__tests__

RUN rm -rf ./.next

RUN npm install \
    && npm run build 

EXPOSE 3000

# Start the app using serve command
CMD ["npm", "start"]
