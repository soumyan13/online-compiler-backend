FROM node:18

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# create temp folder for storing user code files
RUN mkdir -p ./temp && chmod -R 777 ./temp

# install compilers & interpreters
RUN apt-get update && \
    apt-get install -y gcc g++ python3 openjdk-17-jdk && \
    apt-get clean

EXPOSE 5000

CMD ["node", "index.js"]
