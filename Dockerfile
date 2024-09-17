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
    FROM python:3.9-slim AS production
    WORKDIR /app
    
    # Install Node.js
    RUN apt-get update && apt-get install -y nodejs npm
    
    # Copy Node.js app
    COPY --from=dependencies /app/node_modules ./node_modules
    COPY --from=build /app/.next ./.next
    COPY --from=build /app/public ./public
    COPY --from=build /app/package*.json ./
    COPY --from=build /app/next.config.js ./next.config.js
    COPY --from=build /app/next-i18next.config.js ./next-i18next.config.js
    
    # Copy Python app
    COPY app.py ./
    COPY requirements.txt ./
    
    # Install Python dependencies
    RUN pip install --no-cache-dir -r requirements.txt
    
    # Expose ports for Next.js and FastAPI
    EXPOSE 3000 8000
    
    # Start both applications
    CMD ["sh", "-c", "npm start & uvicorn app:app --host 0.0.0.0 --port 8000"]