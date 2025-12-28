package main

import (
	"math/rand"
	"net/http"
	"net/url"
	"time"

	"url-shortener-backend/validator"
	"url-shortener-backend/types"
	"github.com/gin-gonic/gin"
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
	var req types.CreateShortLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	// Validate the URL
	if !isValidURL(req.OriginalURL) {
		c.JSON(http.StatusBadRequest, types.ErrorResponse{Error: "Invalid URL format"})
		return
	}

	types.Mutex.Lock()
    var shortCode string

    // Check custom slug uniqueness, if any
    if req.CustomSlug != "" {
        slug := validator.SanitizeSlug(req.CustomSlug)
        if _, exists := types.ShortLinks[slug]; exists {
            suggestions := validator.GenerateSuggestions(slug)
            c.JSON(http.StatusConflict, gin.H{
                "error": "Slug '" + slug + "' is already taken",
                "suggestions": suggestions,
            })
            return
        }

        // Check prohibited content
        if !validator.ProfanityFilterVar.Contains(slug) {
            shortCode = slug
        } else {
            suggestions := validator.GenerateSuggestions(slug)
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Slug contains prohibited content",
                "suggestions": suggestions,
            })
            return
        }
    } else {
        // Generate random unique short code as slug
		for {
			shortCode = generateShortCode()
			if _, exists := types.ShortLinks[shortCode]; !exists {
				break
			}
		}
	}

	// Create short link
	shortLink := &types.ShortLink{
		ID:          shortCode,
		OriginalURL: req.OriginalURL,
		ShortURL:    "http://localhost:8080/shortlinks/" + shortCode,
		CreatedAt:   time.Now(),
	}

	types.ShortLinks[shortCode] = shortLink
	types.Mutex.Unlock()

	// Return response
	response := types.CreateShortLinkResponse{
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

	types.Mutex.RLock()
	shortLink, exists := types.ShortLinks[id]
	types.Mutex.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, types.ErrorResponse{Error: "Short link not found"})
		return
	}

	c.JSON(http.StatusOK, shortLink)
}

// Get all short links
func getAllShortLinks(c *gin.Context) {
	types.Mutex.RLock()
	links := make([]*types.ShortLink, 0, len(types.ShortLinks))
	for _, link := range types.ShortLinks {
		links = append(links, link)
	}
	types.Mutex.RUnlock()

	c.JSON(http.StatusOK, links)
}

// Redirect to original URL
func redirectShortLink(c *gin.Context) {
	id := c.Param("id")

	types.Mutex.RLock()
	shortLink, exists := types.ShortLinks[id]
	types.Mutex.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, types.ErrorResponse{Error: "Short link not found"})
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

		api.POST("/shortlinks/validate", validator.ValidateSlug)
    	api.GET("/shortlinks/suggest", validator.SuggestSlug)
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
	gin.DefaultWriter.Write([]byte("   POST /shortlinks/validate  - Validate custom slug\n"))
	gin.DefaultWriter.Write([]byte("   GET  /shortlinks/suggest   - Suggest variations for custom slug\n"))
	gin.DefaultWriter.Write([]byte("   GET  /health               - Health check\n\n"))

	if err := r.Run(port); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
