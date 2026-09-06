FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev --prefer-offline --no-fund --no-audit
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
