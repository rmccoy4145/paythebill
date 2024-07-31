FROM node:lts-alpine3.20
LABEL authors="ryanmccoy"

WORKDIR /app
COPY ../ .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]