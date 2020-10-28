FROM buildkite/puppeteer:5.2.1

WORKDIR /app
COPY . .

RUN npm i

ENTRYPOINT ["node", "/app/app.js"]
