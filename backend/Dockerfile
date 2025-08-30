FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p avatars data
RUN echo '[]' > users.json
RUN chmod 666 users.json
RUN chmod 777 avatars
COPY . .
RUN rm -f member_tags.json subsystems.json
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]