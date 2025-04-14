# Backend Dev

This is where the FastAPI and Python code calling to PluralKit API is stored.

.env contains the system token, and the version you see is a template version (NOT THE ACTUAL TOKEN WE USE)

Installing and running:
```bash
pip install -r requirements.txt
nano .env
uvicorn main:app --host 0.0.0.0 --port 8000
```