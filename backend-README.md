# URL Shortener Backend (Go + Gin)

A simple Go backend service using the Gin framework for the URL shortener frontend application.

## Quick Start

```bash
# Install dependencies
go mod tidy

# Run the server
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Create Short Link
```bash
curl -X POST http://localhost:8080/api/shortlinks \
  -H "Content-Type: application/json" \
  -d '{"original_url": "https://example.com"}'
```

**Response:**
```json
{
  "id": "abc123",
  "original_url": "https://example.com",
  "short_url": "http://localhost:8080/shortlinks/abc123",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get Short Link Details
```bash
curl http://localhost:8080/api/shortlinks/abc123
```

**Response:**
```json
{
  "id": "abc123",
  "original_url": "https://example.com",
  "short_url": "http://localhost:8080/shortlinks/abc123",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get All Short Links (Bonus)
```bash
curl http://localhost:8080/api/shortlinks
```

**Response:**
```json
[
  {
    "id": "abc123",
    "original_url": "https://example.com",
    "short_url": "http://localhost:8080/shortlinks/abc123",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Test Redirect
```bash
curl -I http://localhost:8080/shortlinks/abc123
```

### Health Check
```bash
curl http://localhost:8080/health
```
