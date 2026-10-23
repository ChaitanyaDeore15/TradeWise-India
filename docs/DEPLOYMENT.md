# Deployment & Production Operations Guide

## 1. Local Development Environment

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm 9+

### Backend Run
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

### Frontend Run
```bash
cd frontend
npm install
npm run dev
```

---

## 2. Docker & Containerized Deployment

```bash
docker-compose up --build
```
- Multi-stage Nginx container serving optimized static React assets.
- FastAPI backend running under Uvicorn with automated health checks (`/health`).

---

## 3. Environment Variables

| Variable | Default Value | Production Recommendation |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | Set to `production` |
| `SECRET_KEY` | `tradewise_dev_secret` | Cryptographically random 64-char string |
| `DATABASE_URL` | `sqlite:///./tradewise.db` | PostgreSQL connection string |
| `MARKET_DATA_MODE` | `sample_verified` | Set to `live_adapter` when licensed |
