# ChatBot Luật Việt Nam backend

## 1. Yêu cầu hệ thống

- Docker và Docker Compose đã cài đặt trên máy.
- (Tùy chọn) Python 3.10+ nếu muốn chạy ngoài Docker.

## 2. Cấu hình môi trường

Tạo file `.env` (đã có sẵn mẫu):

```env
DEBUG=flase
LOG_LEVEL=INFO
LOG_SIZE_LIMIT=10 MB
SERVICE_NAME=chatbot
PG_USER=postgres
PG_PWD=your_pw
PG_HOST=localhost
PG_PORT=5432
DB_NAME=news_db
GEMINI_API_KEY=your_api_key
OPENAI_API_KEY=your_api_key
```
> **Lưu ý:** Thay `your_gemini_api_key` bằng API key thật của mấy ông vô

## 3. Build và chạy bằng Docker Compose
uvicorn app.api.api:app --reload

```sh
docker-compose up --build
```

- API FastAPI sẽ chạy ở: [http://localhost:8000/docs](http://localhost:8000/docs)
- Giao diện người dùng (UI) Streamlit: [http://localhost:8501](http://localhost:8501)

