
FROM node:22-slim AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY database ./database
COPY data ./data
COPY --from=frontend-build /app/dist ./dist

ENV PYTHONPATH=/app/backend
ENV FRONTEND_DIST=/app/dist
ENV DATABASE_PATH=/app/database/inventory.db

WORKDIR /app/backend

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
