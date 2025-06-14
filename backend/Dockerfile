# Stage 1: Build frontend
FROM node:20-alpine as frontend-builder
WORKDIR /frontend
COPY ../frontend/package*.json ./
RUN npm install
COPY ../frontend/ ./
RUN npm run build

# Stage 2: Backend with frontend files
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p avatars
RUN touch users.json
RUN chmod 666 users.json
RUN chmod 777 avatars

# Copy frontend build files
COPY --from=frontend-builder /frontend/dist ./static/

# Copy backend files
COPY . .
RUN rm -f member_tags.json subsystems.json
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]