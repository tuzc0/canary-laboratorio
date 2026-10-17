FROM node:22-alpine
WORKDIR /app
COPY server.js ./server.js
ARG RELEASE_VERSION=unknown
ENV RELEASE_VERSION=${RELEASE_VERSION}
ENV PORT=3000
USER node
EXPOSE 3000
CMD ["node", "server.js"]
