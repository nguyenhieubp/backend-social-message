FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18
WORKDIR /app
COPY --from=builder /app .
RUN npm install --omit=dev
EXPOSE 3000
EXPOSE 3001
CMD ["node", "dist/main"]
