# Backend & AI Engine Shared Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libpq-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"
ENV POETRY_VIRTUALENVS_CREATE=false

# Copy project definition
# Note: This expects build context to be the project root
COPY backend/pyproject.toml backend/poetry.lock* /app/backend/

WORKDIR /app/backend

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-root

# Copy application code
COPY backend /app/backend
COPY ai-engine /app/ai-engine

# Set PYTHONPATH to include backend and ai-engine
ENV PYTHONPATH=/app/backend:/app/ai-engine

# Expose ports
EXPOSE 8080 5000

# Default command (overridden in compose)
CMD ["bash"]
