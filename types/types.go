// types/types.go
package types

import (
	"sync"
	"time"
)

// ShortLink represents a shortened URL
type ShortLink struct {
	ID          string    `json:"id"`
	OriginalURL string    `json:"original_url"`
	ShortURL    string    `json:"short_url"`
	CreatedAt   time.Time `json:"created_at"`
}

// CreateShortLinkRequest represents the request payload for creating a short link
type CreateShortLinkRequest struct {
	OriginalURL string `json:"original_url" binding:"required"`
	CustomSlug  string `json:"custom_slug"`
}

// CreateShortLinkResponse represents the response for creating a short link
type CreateShortLinkResponse struct {
	ID          string    `json:"id"`
	OriginalURL string    `json:"original_url"`
	ShortURL    string    `json:"short_url"`
	CreatedAt   time.Time `json:"created_at"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// In-memory storage for short links
var (
	ShortLinks = make(map[string]*ShortLink)
	Mutex      = sync.RWMutex{}
)
