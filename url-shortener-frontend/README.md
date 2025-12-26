# URL Shortener Frontend

A Next.js + TypeScript + Tailwind CSS frontend for a URL shortener application. This project allows users to shorten URLs, view their link history, copy links to the clipboard, and navigate to shortened URLs.

---

## Setup Instructions

```bash
# Open terminal in project folder
# Run backend server
go run main.go

# Open second terminal in frontend folder
cd url-shortener-frontend

# Install additional dependencies (if any)
npm install

# Start the development server
npm run dev
```

## Environment Configuration

```bash
# .env.local example
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Usage
### Features
- Create short links from original URLs.
- Display a history table of created links with copy-to-clipboard functionality.
- Click on links to open in a new tab.
- Loading state while fetching data.
- Success and error feedback messages.
- Fully typed with TypeScript for type safety.
- Styled using Tailwind CSS with responsive design.

### Video Example
Video

## Step-by-Step User Flow
- Open the app in the browser at http://localhost:3000.
- Enter an original URL in the input field.
- Click the enter button.
- New short link is generated with option to open in new tab or to copy url to clipboard.
- Click the history icon to view the new short link in the history table below.
- Copy the short link using the "Copy" button.
- Click the links or "Test Link" button to test redirection in a new tab.
- Repeat the process to create additional short links.

## API Integration
The frontend communicates with the backend API to manage short links.
- Documentation of how the frontend connects to the backend

### Example API request
#### Create Short Link
```bash
POST /api/shortlinks
Content-Type: application/json

{
  "original_url": "https://example.com"
}
```
Response
```bash
{
  "id": "1",
  "original_url": "https://example.com",
  "short_url": "http://localhost:8080/shortlinks/abc123",
  "created_at": "2025-12-26T12:00:00.000Z"
}
```

#### Get All Short Links
```bash
GET /api/shortlinks
```
Response
```bash
[
  {
    "id": "1",
    "original_url": "https://example.com",
    "short_url": "http://localhost:8080/shortlinks/abc123",
    "created_at": "2025-12-26T12:00:00.000Z"
  }
]
```

#### Redirect to Original URL
- Redirects to the original URL in the browser.
```bash
GET /shortlinks/abc123
```

## Testing
### Run Unit & Integration Tests
```bash
# Run all tests
npm test

# Test production build
npm run build
```
