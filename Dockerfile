# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the app using Python and FastAPI
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies if any, and Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code and the built frontend
COPY backend/ ./backend/
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 8000

# Set environment variable for port
ENV PORT=8000

# Run uvicorn server
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
