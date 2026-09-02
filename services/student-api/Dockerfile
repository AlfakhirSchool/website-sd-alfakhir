FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
VOLUME ["/app/data"]
EXPOSE 4001
CMD ["node", "server.js"]
