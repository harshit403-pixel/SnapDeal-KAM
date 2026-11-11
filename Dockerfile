FROM node:24-alpine AS client-build

WORKDIR /app

COPY Client/package*.json ./

RUN npm install

COPY Client/ ./

RUN npm run build


FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY Server/package*.json ./

RUN npm install --omit=dev

COPY Server/ ./

COPY --from=client-build /app/dist ./public

EXPOSE 3000

CMD ["node", "server.js"]