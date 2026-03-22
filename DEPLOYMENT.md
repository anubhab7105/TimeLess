# TimeLess - Deployment Guide

## Local Development

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Clone/Download the project**
   ```bash
   cd TimeLess
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run locally**
   ```bash
   python app.py
   ```
   
   The app will run at `http://127.0.0.1:5000`

### Environment Variables
Create a `.env` file based on `.env.example`:
```
DEBUG=True
PORT=5000
HOST=127.0.0.1
```

---

## Production Deployment

### Option 1: Heroku (Recommended for beginners)

1. **Install Heroku CLI** - https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a Heroku app**
   ```bash
   heroku create your-app-name
   ```

4. **Add gunicorn to requirements.txt**
   ```bash
   pip install gunicorn
   pip freeze > requirements.txt
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Open your app**
   ```bash
   heroku open
   ```

### Option 2: Railway.app (Modern alternative)

1. **Connect GitHub repository** - https://railway.app

2. **Railway auto-detects Flask**

3. **Set environment variables in dashboard**
   - DEBUG=False
   - HOST=0.0.0.0

### Option 3: AWS, Azure, Google Cloud

- Use their Python web hosting services
- Set environment variables:
  - `HOST=0.0.0.0`
  - `PORT=8000` (or provided port)
  - `DEBUG=False`

### Option 4: Docker (For any platform)

Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

COPY . .

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "--workers", "4", "app:app"]
```

Build and run:
```bash
docker build -t timeless .
docker run -p 5000:5000 timeless
```

---

## Features

✅ **Local Development** - Fast development server  
✅ **Static File Serving** - CSS, JS, Images  
✅ **API Endpoints** - `/api/products`, `/api/products/<id>`  
✅ **Error Handling** - 404 and 500 error handlers  
✅ **Health Check** - `/health` endpoint for monitoring  
✅ **Environment Variables** - Flexible configuration  

## Troubleshooting

**Port already in use?**
```bash
# Change PORT in .env or use:
python app.py --port 3000
```

**Module not found?**
```bash
pip install -r requirements.txt
```

**Can't connect locally?**
- Make sure `HOST=127.0.0.1` in `.env`
- Check if firewall is blocking port 5000

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home page |
| `/pages/<page>` | GET | Shop, About, Contact pages |
| `/api/products` | GET | Get all products |
| `/api/products/<id>` | GET | Get single product by ID |
| `/health` | GET | Health check |

---

For more help, visit: https://docs.heroku.com or https://docs.railway.app
