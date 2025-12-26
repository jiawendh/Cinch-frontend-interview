package main

import (
	"math/rand"
	"net/http"
	"net/url"
	"sync"
	"time"
	"strings"
	"strconv"

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
	shortLinks = make(map[string]*ShortLink)
	mutex      = sync.RWMutex{}
)

// SlugValidationRequest represents the request payload for slug verification
type SlugValidationRequest struct {
    CustomSlug string `json:"custom_slug" binding:"required"`
}

// Profanity or prohibited words
var prohibitedWords = []string{
	"admin", "administrator", "api", "root", "sys",
    "config", "server", "system", "backend", "frontend",
	"login", "logout", "signin", "signup", "auth",
    "token", "jwt", "password", "secret", "superuser",
    "test", "debug", "staging", "prod", "production",
    "god", "null", "undefined", "void", "error", "health",
	"ass", "fuck", "shit", "damn", "bitch",
}
var profanityFilter = NewProfanityFilter(prohibitedWords)

type TrieNode struct {
    children map[rune]*TrieNode
    isEnd bool
}

type ProfanityFilter struct {
    root *TrieNode
}

func NewProfanityFilter(words []string) *ProfanityFilter {
    pf := &ProfanityFilter{root: &TrieNode{children: map[rune]*TrieNode{}}}
    for _, word := range words {
        pf.Insert(word)
    }
    return pf
}

func (pf *ProfanityFilter) Insert(word string) {
    node := pf.root
    word = strings.ToLower(word)
    for _, r := range word {
        if node.children[r] == nil {
            node.children[r] = &TrieNode{children: map[rune]*TrieNode{}}
        }
        node = node.children[r]
    }
    node.isEnd = true
}

// Checks if text contains any prohibited substring
func (pf *ProfanityFilter) Contains(text string) bool {
    text = strings.ToLower(obfuscateText(text))
    for i := 0; i < len(text); i++ {
        node := pf.root
        for j := i; j < len(text); j++ {
            r := rune(text[j])
            if node.children[r] == nil {
                break
            }
            node = node.children[r]
            if node.isEnd {
                return true
            }
        }
    }
    return false
}

// Replace common obfuscations
func obfuscateText(text string) string {
    replacer := strings.NewReplacer(
        "0", "o",
        "1", "i",
        "@", "a",
        "3", "e",
    )
    return replacer.Replace(text)
}

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

// Validate slug content
func validateSlug(c *gin.Context) {
    var req SlugValidationRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Invalid request"})
        return
    }

    slug := sanitizeSlug(req.CustomSlug)

    var reason string
	var valid = true
	var suggestions []string

	if _, exists := shortLinks[slug]; exists {
		reason = "Slug is already taken"
		valid = false
		suggestions = generateSuggestions(slug)
	} else if profanityFilter.Contains(slug) {
		reason = "Slug contains prohibited content"
		valid = false
	}

	if !valid {
		c.JSON(http.StatusOK, gin.H{
			"valid":       false,
			"slug":        slug,
			"reason":      reason,
			"suggestions": suggestions,
		})
		return
	}

    c.JSON(http.StatusOK, gin.H {
        "valid": true,
        "slug": slug,
        "reason": "",
    })
}

// Get slug suggestions
func suggestSlug(c *gin.Context) {
    desired := c.Query("slug")
    slug := sanitizeSlug(desired)
    available := true

    mutex.RLock()
    if _, exists := shortLinks[slug]; exists || profanityFilter.Contains(slug) {
        available = false
    }
    mutex.RUnlock()

    suggestions := []string{}
    if !available {
        suggestions = generateSuggestions(slug)
    }

    c.JSON(http.StatusOK, gin.H{
        "original": slug,
        "available": available,
        "suggestions": suggestions,
    })
}

// Generate slug suggestions
func generateSuggestions(slug string) []string {
	rand.Seed(time.Now().UnixNano())
    suggestions := []string{}

	// Random numeric suffixes
	for i := 0; i < 2; i++ {
		n := rand.Intn(10000) // 0-9999
		suggestions = append(suggestions, slug+"-"+strconv.Itoa(n))
	}

    // Remove vowels
    noVowels := removeVowels(slug)
    suggestions = append(suggestions, noVowels)

    // Prefix
	prefix := []string{}
	prefix = append(prefix, "my-", "the-", "new-")
	for i := 0; i < 2; i++ {
		index := rand.Intn(3) // 0-2
		newItem := prefix[index] + slug
		if !contains(suggestions, newItem) {
			suggestions = append(suggestions, newItem)
		}
	}

    // Suffix
	suffix := []string{}
	suffix = append(suffix, "-link", "ation", "ing")
	for i := 0; i < 2; i++ {
		index := rand.Intn(3) // 0-2
		newItem :=  slug + suffix[index]
		if !contains(suggestions, newItem) {
			suggestions = append(suggestions, newItem)
		}
	}

	filtered := suggestions[:0]
	for _, s := range suggestions {
		if len(s) >= 3 {
			filtered = append(filtered, s)
		}
	}
	suggestions = filtered

    return suggestions[:5]
}

// Remove vowels helper function
func removeVowels(s string) string {
    return strings.Map(func(r rune) rune {
        switch r {
        case 'a','e','i','o','u': return -1
        default: return r
        }
    }, s)
}

// Only lowercase letters, numbers, and hyphens helper function
func sanitizeSlug(input string) string {
    s := strings.ToLower(input)

    // Replace spaces with hyphens
    s = strings.ReplaceAll(s, " ", "-")

    // Allow only a-z, 0-9, hyphens
    var result []rune
    for _, r := range s {
        if (r >= 'a' && r <= 'z') ||
            (r >= '0' && r <= '9') ||
            r == '-' {
            result = append(result, r)
        }
    }

    // Remove duplicate hyphens
    cleaned := string(result)
    cleaned = strings.Trim(cleaned, "-")
    cleaned = strings.Join(strings.FieldsFunc(cleaned, func(r rune) bool {
        return r == '-'
    }), "-")

    return cleaned
}

// Check if item already exist in array helper function
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
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

	mutex.Lock()
    var shortCode string

    // Check custom slug uniqueness, if any
    if req.CustomSlug != "" {
        slug := sanitizeSlug(req.CustomSlug)
        if _, exists := shortLinks[slug]; exists {
            suggestions := generateSuggestions(slug)
            c.JSON(http.StatusConflict, gin.H{
                "error": "Slug '" + slug + "' is already taken",
                "suggestions": suggestions,
            })
            return
        }

        // Check prohibited content
        if !profanityFilter.Contains(slug) {
            shortCode = slug
        } else {
            suggestions := generateSuggestions(slug)
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
			if _, exists := shortLinks[shortCode]; !exists {
				break
			}
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

		api.POST("/shortlinks/validate", validateSlug)
    	api.GET("/shortlinks/suggest", suggestSlug)
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
