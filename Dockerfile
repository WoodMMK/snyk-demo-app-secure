# Vulnerability: Using an extremely outdated base image (Node 10)
# Snyk Container will find hundreds of OS-level vulnerabilities here
FROM node:25.9.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]