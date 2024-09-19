# ---- Base Node ----
FROM node:19-alpine AS base
WORKDIR /app
COPY package*.json ./
    
# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci
    
# ---- Build ----
FROM dependencies AS build
COPY . .
RUN npm run build
    
# ---- Production ----
FROM openmmlab/lmdeploy:v0.5.3-cu12

# INSTALL NODEJS
RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash
RUN apt-get install -y nodejs

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/next-i18next.config.js ./next-i18next.config.js
    
COPY chat_template.json /app/chat_template.json

# Expose the port the app will run on
EXPOSE 3000
    
# Start the application
ENTRYPOINT [ "/bin/sh", "-c" ]
CMD ["lmdeploy serve api_server ./models/snapshots/db1f81ad4b8c7e39777509fac66c652eb0a52f91 --model-name llama3.1 --chat-template ./chat_template.json --model-format awq & npm start"]
    