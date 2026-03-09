FROM node:22-alpine AS build

WORKDIR /src

COPY * .
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /src/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
