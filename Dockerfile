FROM node:18

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN mkdir -p ./temp && chmod -R 777 ./temp

RUN apt-get update && \
    apt-get install -y gcc openjdk-17-jdk && \
    apt-get clean

EXPOSE 5000

CMD ["node", "index.js"]
