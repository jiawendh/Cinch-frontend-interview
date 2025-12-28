package validator

import (
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"url-shortener-backend/types"
	"github.com/gin-gonic/gin"
)

type ProfanityChecker interface {
	Contains(string) bool
}

type ValidationResult struct {
	Valid       bool     `json:"valid"`
	Reason      string   `json:"reason,omitempty"`
	Suggestions []string `json:"suggestions,omitempty"`
}

// SlugValidationRequest represents the request payload for slug verification
type SlugValidationRequest struct {
    CustomSlug string `json:"custom_slug" binding:"required"`
}

type TrieNode struct {
    children map[rune]*TrieNode
    isEnd bool
}

type ProfanityFilter struct {
    root *TrieNode
}

func ValidateSlugLogic(
	slug string,
	shortLinks map[string]*types.ShortLink,
	profanity ProfanityChecker,
) ValidationResult {
	if profanity.Contains(slug) {
		return ValidationResult{
			Valid:  false,
			Reason: "\"" + slug + "\" contains prohibited content",
		}
	}

	if _, exists := shortLinks[slug]; exists {
		return ValidationResult{
			Valid: false,
			Reason: "\"" + slug + "\" is already taken",
			Suggestions: GenerateSuggestions(slug),
		}
	}

	return ValidationResult{ Valid: true }
}

// Validate slug content
func ValidateSlug(c *gin.Context) {
    var req SlugValidationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

    slug := SanitizeSlug(req.CustomSlug)

	result := ValidateSlugLogic(
		slug,
		types.ShortLinks,
		ProfanityFilterVar,
	)

	c.JSON(http.StatusOK, result)
}

// Get slug suggestions
func SuggestSlug(c *gin.Context) {
    desired := c.Query("slug")
    slug := SanitizeSlug(desired)
    available := true

    types.Mutex.RLock()
    if _, exists := types.ShortLinks[slug]; exists || ProfanityFilterVar.Contains(slug) {
        available = false
    }
    types.Mutex.RUnlock()

    suggestions := []string{}
    if !available {
        suggestions = GenerateSuggestions(slug)
    }

    c.JSON(http.StatusOK, gin.H{
        "original": slug,
        "available": available,
        "suggestions": suggestions,
    })
}

// Generate slug suggestions
func GenerateSuggestions(slug string) []string {
	rand.Seed(time.Now().UnixNano())
    suggestions := []string{}

	// Random numeric suffixes
	for i := 0; i < 2; i++ {
		n := rand.Intn(10000) // 0-9999
		suggestions = append(suggestions, slug+"-"+strconv.Itoa(n))
	}

    // Remove vowels
    noVowels := RemoveVowels(slug)
    suggestions = append(suggestions, noVowels)

    // Prefix
	prefix := []string{}
	prefix = append(prefix, "my-", "the-", "new-")
	for i := 0; i < 2; i++ {
		index := rand.Intn(3) // 0-2
		newItem := prefix[index] + slug
		if !Contain(suggestions, newItem) {
			suggestions = append(suggestions, newItem)
		}
	}

    // Suffix
	suffix := []string{}
	suffix = append(suffix, "-link", "ation", "ing")
	for i := 0; i < 2; i++ {
		index := rand.Intn(3) // 0-2
		newItem :=  slug + suffix[index]
		if !Contain(suggestions, newItem) {
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