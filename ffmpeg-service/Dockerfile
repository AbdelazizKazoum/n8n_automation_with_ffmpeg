FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && chmod +x node_modules/ffmpeg-static/ffmpeg

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
