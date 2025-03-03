# build : docker build -t agah-image .
FROM node:14

# make a working directory
RUN mkdir -p /usr/src/agah
RUN mkdir -p /usr/src/agah/uploads
WORKDIR /usr/src/agah

# install node_modules
COPY package.json .
RUN npm install
# RUN npm install -g tsc
RUN npm install -g cross-env

# copy the rest of files
COPY . .

# build the back-end and front-end
RUN ./node_modules/typescript/bin/tsc
RUN npm run build-prod

# relocate non ts files
RUN mkdir -p ./dist/express/app/Notifications/templates
COPY app/Notifications/templates ./dist/express/app/Notifications/templates

EXPOSE 3000

#command to run within the container
CMD ["cross-env", "NODE_ENV=production", "node", "./dist/express/server.js"]