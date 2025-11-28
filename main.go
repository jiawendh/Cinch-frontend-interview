package main

import (
	"math/rand"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
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
	shortLinks = make(map[string]*ShortLink)
	mutex      = sync.RWMutex{}
)

// Generate a random short code
func generateShortCode() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 6)
	for i := range code {
		code[i] = charset[rand.Intn(len(charset))]
	}
	return string(code)
}

// Validate URL format
func isValidURL(rawURL string) bool {
	_, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return false
	}
	u, err := url.Parse(rawURL)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return false
	}
	return u.Scheme == "http" || u.Scheme == "https"
}

// CORS middleware
func corsMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})
}

// Create a new short link
func createShortLink(c *gin.Context) {
	var req CreateShortLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	// Validate the URL
	if !isValidURL(req.OriginalURL) {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid URL format"})
		return
	}

	// Generate unique short code
	var shortCode string
	mutex.Lock()
	for {
		shortCode = generateShortCode()
		if _, exists := shortLinks[shortCode]; !exists {
			break
		}
	}

	// Create short link
	shortLink := &ShortLink{
		ID:          shortCode,
		OriginalURL: req.OriginalURL,
		ShortURL:    "http://localhost:8080/shortlinks/" + shortCode,
		CreatedAt:   time.Now(),
	}

	shortLinks[shortCode] = shortLink
	mutex.Unlock()

	// Return response
	response := CreateShortLinkResponse{
		ID:          shortLink.ID,
		OriginalURL: shortLink.OriginalURL,
		ShortURL:    shortLink.ShortURL,
		CreatedAt:   shortLink.CreatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// Get short link details by ID
func getShortLink(c *gin.Context) {
	id := c.Param("id")

	mutex.RLock()
	shortLink, exists := shortLinks[id]
	mutex.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Short link not found"})
		return
	}

	c.JSON(http.StatusOK, shortLink)
}

// Get all short links
func getAllShortLinks(c *gin.Context) {
	mutex.RLock()
	links := make([]*ShortLink, 0, len(shortLinks))
	for _, link := range shortLinks {
		links = append(links, link)
	}
	mutex.RUnlock()

	c.JSON(http.StatusOK, links)
}

// Redirect to original URL
func redirectShortLink(c *gin.Context) {
	id := c.Param("id")

	mutex.RLock()
	shortLink, exists := shortLinks[id]
	mutex.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Short link not found"})
		return
	}

	c.Redirect(http.StatusMovedPermanently, shortLink.OriginalURL)
}

// Health check endpoint
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

// Request logging middleware
func requestLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return ""
	})
}

func main() {
	// Seed random number generator
	rand.Seed(time.Now().UnixNano())

	// Create Gin router
	r := gin.Default()

	// Add middleware
	r.Use(corsMiddleware())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// API routes group
	api := r.Group("/api")
	{
		api.POST("/shortlinks", createShortLink)
		api.GET("/shortlinks/:id", getShortLink)
		api.GET("/shortlinks", getAllShortLinks)
	}

	// Redirect routes
	r.GET("/shortlinks/:id", redirectShortLink)

	// Health check
	r.GET("/health", healthCheck)

	// Start server
	port := ":8080"
	gin.DefaultWriter.Write([]byte("🚀 URL Shortener Backend starting on http://localhost" + port + "\n"))
	gin.DefaultWriter.Write([]byte("📋 Available endpoints:\n"))
	gin.DefaultWriter.Write([]byte("   POST /api/shortlinks       - Create short link\n"))
	gin.DefaultWriter.Write([]byte("   GET  /api/shortlinks/:id   - Get short link details\n"))
	gin.DefaultWriter.Write([]byte("   GET  /api/shortlinks       - Get all short links\n"))
	gin.DefaultWriter.Write([]byte("   GET  /shortlinks/:id       - Redirect to original URL\n"))
	gin.DefaultWriter.Write([]byte("   GET  /health               - Health check\n\n"))

	if err := r.Run(port); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
