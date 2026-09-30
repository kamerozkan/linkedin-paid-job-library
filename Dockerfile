FROM apify/actor-node:22
COPY --chown=myuser:myuser package*.json ./
RUN npm --quiet set progress=false && npm ci --omit=dev --audit=false
COPY --chown=myuser:myuser . ./
RUN npm test
CMD ["npm", "start"]
