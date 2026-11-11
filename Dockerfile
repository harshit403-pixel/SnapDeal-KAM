FROM node:24-alpine AS client-build

WORKDIR /app

COPY Client/package*.json ./

RUN npm ci

COPY Client/ ./

RUN npm run build


FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_ORIGIN=http://localhost:8080

COPY Server/package*.json ./

RUN npm ci --omit=dev

COPY Server/ ./

COPY --from=client-build /app/dist ./public

EXPOSE 8080

CMD ["npm", "start"]