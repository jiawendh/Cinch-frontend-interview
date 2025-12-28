package validator

import (
	"strings"
)

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
var ProfanityFilterVar = NewProfanityFilter(prohibitedWords)

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
    text = strings.ToLower(ObfuscateText(text))
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
func ObfuscateText(text string) string {
    replacer := strings.NewReplacer(
        "0", "o",
        "1", "i",
        "@", "a",
        "3", "e",
    )
    return replacer.Replace(text)
}

// Remove vowels
func RemoveVowels(s string) string {
    return strings.Map(func(r rune) rune {
        switch r {
            case 'a','e','i','o','u':
                return -1
            default:
                return r
        }
    }, s)
}

// Only lowercase letters, numbers, and hyphens
func SanitizeSlug(input string) string {
    s := strings.ToLower(input)

    // Replace spaces with hyphens
    s = strings.ReplaceAll(s, " ", "-")

    // Allow only a-z, 0-9, hyphens
    var result []rune
    for _, r := range s {
        if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
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

// Check if item already exist in array
func Contain(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}