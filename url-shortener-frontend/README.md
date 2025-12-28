# URL Shortener Frontend

A Next.js + TypeScript + Tailwind CSS frontend for a URL shortener application. This project allows users to shorten URLs, view their link history, copy links to the clipboard, and navigate to shortened URLs. It also support custom short URLs (slugs) with intelligent validation, profanity filtering, and suggestion generation.

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

### Environment Configuration

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
- Custom short URLs (slugs) support with
  - Intelligent validation,
  - Profanity filtering,
  - And related suggestion generation

### Loom Video
https://www.loom.com/share/2e4227a7a2884362b730b266f7fd2ed5

### Step-by-Step User Flow
- Open the app in the browser at http://localhost:3000.
- Enter an original URL in the input field.
  - Check the custom slug checkbox to input custom short link.
  - Enter custom short link in the input field.
  - Verify that custom short link is available and valid.
- Click the enter button.
- New short link is generated with option to open in new tab or to copy url to clipboard.
- Click the history icon to view the new short link in the history table below.
- Copy the short link using the "Copy" button.
- Click the links or "Test Link" button to test redirection in a new tab.
- Repeat the process to create additional short links.

## API Integration
The frontend communicates with the backend API to manage short links.

### Profanity Filtering (Trie-Based)
A Trie (prefix tree) is used to efficiently detect prohibited words within a slug.

This allows:
- O(m) time complexity, where m is the length of the slug
- Fast substring detection
- Case-insensitive matching
- Detection of obfuscated words (e.g. @dm1n > admin)

#### Example Prohibited Words
```bash
[]string{
  "admin", "administrator", "api", "root", "sys",
  "config", "server", "system", "backend", "frontend",
  "login", "logout", "signin", "signup", "auth",
  "token", "jwt", "password", "secret", "superuser",
  "test", "debug", "staging", "prod", "production",
  "god", "null", "undefined", "void", "error", "health",
  "ass", "fuck", "shit", "damn", "bitch",
}
```

#### Obfuscation Handling
Before validation, slugs are normalized:
- 0 > o
- 1 > i
- @ > a
- 3 > e

Example
```bash
@dm1n-panel > admin-panel
```

#### Algorithm Complexity
| Operation   | Complexity             |
| ----------- | ---------------------- |
| Insert word | O(k)                   |
| Check slug  | O(m)                   |
| Memory      | O(n)                   |

Where:
- k = length of prohibited word
- m = length of input slug
- n = total characters in word list

#### Example Validation Flow
- User types `admin`
- Frontend sends request to `/api/shortlinks/validate`
- Backend:
  - Normalizes input
  - Runs Trie substring match
  - Detects prohibited content
- Response includes suggestions
- User clicks a suggestion to autofill

### Example API request
#### Create Short Link
Creates a short link. If custom_slug is provided, the backend validates it for availability and prohibited content.

```bash
POST /api/shortlinks
Content-Type: application/json
```
Request
```bash
{
  "original_url": "https://example.com",
  "custom_slug": "my-link"
}
```
Success Response
```bash
{
  "id": "my-link",
  "original_url": "https://example.com",
  "short_url": "http://localhost:8080/shortlinks/my-link",
  "created_at": "2025-12-26T12:00:00.000Z"
}
```
Error Response (Slug Taken)
```bash
{
  "error": "Slug 'my-link' is already taken",
  "suggestions": [
    "my-link-1",
    "my-link-500",
    "my-lnk",
    "my-linkation"
  ]
}
```

#### Validate Custom Slug
Validates a slug before creation. This endpoint checks:
- Format rules
- Profanity / reserved words
- Obfuscated prohibited content

```bash
POST /api/shortlinks/validate
```
Request
```bash
{
  "custom_slug": "my-cool-link"
}
```
Valid Response
```bash
{
  "valid": true,
  "slug": "my-cool-link",
  "reason": ""
}
```
Invalid Response
```bash
{
  "valid": false,
  "slug": "admin",
  "reason": "Contains prohibited content"
}
```

#### Suggest Available Slugs
Returns intelligent suggestions when a slug is unavailable or invalid.

```bash
GET /api/shortlinks/suggest?slug=desired-name
```
Response
```bash
{
  "original": "popular",
  "available": false,
  "suggestions": [
    "popular-1",
    "popular-500",
    "pplr",
    "my-popular",
    "popular-link"
  ]
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
Redirects to the original URL in the browser.
```bash
GET /shortlinks/abc123
```

## Testing
### Run Unit & Integration Tests
```bash
# Run all tests
npm test

# Test backend
go test ./...

# Test production build
npm run build
```
