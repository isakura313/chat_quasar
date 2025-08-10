FROM node:lts-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm i

COPY . .

ARG VITE_WS_URL=ws://localhost:8181
ENV VITE_WS_URL=${VITE_WS_URL}

RUN npm run build

FROM nginx:1.25-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/spa /usr/share/nginx/html
EXPOSE 80

# простой healthcheck
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1
