# Use the official fast Python image as a parent image
FROM python:3.11-slim-buster

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Set the working directory in the container
WORKDIR /usr/src/app

# Set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the content of the local src directory to the working directory
COPY . .

# Specify the command to run on container start
CMD ["gunicorn", "main:app", "-w", "4", "-b", "0.0.0.0:80", "-k", "uvicorn.workers.UvicornWorker", "--threads", "4", "--timeout", "300", "--keep-alive", "2"]


