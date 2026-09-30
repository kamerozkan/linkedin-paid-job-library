FROM apify/actor-node-playwright-chrome:22
COPY package.json ./
RUN npm install --omit=dev --audit=false
COPY main.js ./
CMD ["node", "main.js"]
