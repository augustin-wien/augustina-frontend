FROM node:18 as build

WORKDIR /app

COPY package*.json /app/
COPY yarn.lock /app/

RUN yarn
COPY . /app

RUN yarn build

FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/custom.conf
COPY ./docker/entrypoint.sh /docker-entrypoint.d/10-entrypoint.sh