FROM python:3.13.7-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p avatars data

# Initialize users.json with an empty list
RUN echo '[]' > users.json

# Set appropriate permissions
RUN chmod 666 users.json
RUN chmod 777 avatars

# Copy the rest of the application code into the container
COPY . .

# Remove unnecessary files
RUN rm -f member_tags.json subsystems.json

# Expose the application port
EXPOSE 8000

# Define the command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
