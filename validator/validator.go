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
			Suggestions: GenerateSuggestions(
				slug,
				types.ShortLinks,
				ProfanityFilterVar,
			),
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
		suggestions = GenerateSuggestions(
			slug,
			types.ShortLinks,
			ProfanityFilterVar,
		)
    }

    c.JSON(http.StatusOK, gin.H{
        "original": slug,
        "available": available,
        "suggestions": suggestions,
    })
}

// Generate slug suggestions
func GenerateSuggestions(
	slug string,
	shortLinks map[string]*types.ShortLink,
	profanity ProfanityChecker,
) []string {
	rand.Seed(time.Now().UnixNano())
    suggestions := []string{}
	maxLen := 5
	used := make(map[string]bool)
	remaining := func() int { return maxLen - len(suggestions) }

	// Helper to add unique suggestion
	used[slug] = true
    add := func(item string) {
        if len(item) < 3 || profanity.Contains(item) || used[item] {
            return
        }

		if _, exists := shortLinks[item]; exists {
			return
		}

        if len(suggestions) < maxLen {
            suggestions = append(suggestions, item)
            used[item] = true
        }
    }

	// Random numeric suffixes
	for i := 0; i < rand.Intn(remaining()) + 1; i++ {
		num := rand.Intn(10000) // 0-9999
		add(slug + "-" + strconv.Itoa(num))
	}

    // Prefix
	if(remaining() > 0) {
		prefixes := []string{"my-", "the-", "new-", "my", "the", "new"}
		for i := 0; i < rand.Intn(remaining()) + 1; i++ {
			index := rand.Intn(len(prefixes))
			add(prefixes[index] + slug)
		}
	}

    // Suffix
	if(remaining() > 0) {
		suffixes := []string{"-link", "link", "-url", "url", "-page"}
		for i := 0; i < remaining(); i++ {
			index := rand.Intn(len(suffixes))
			add(slug + suffixes[index])
		}
	}

    // Remove vowels
	add(RemoveVowels(slug))

	// Replace characters
	add(ReplaceCharacters(slug))

	if len(suggestions) > maxLen {
		return suggestions[:maxLen]
	}
	return suggestions
}