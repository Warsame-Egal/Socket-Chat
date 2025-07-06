FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN npm run build
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]