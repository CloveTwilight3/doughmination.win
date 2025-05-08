FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Create directories for data storage
RUN mkdir -p avatars
RUN touch users.json
RUN chmod 666 users.json
RUN chmod 777 avatars

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]