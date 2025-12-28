package validator

import (
    "math/rand"
	"strings"
    "time"
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
    pf := &ProfanityFilter{
        root: &TrieNode{
            children: make(map[rune]*TrieNode),
        },
    }

    for _, word := range words {
        pf.root.Insert(word)
    }

    return pf
}

func (p *ProfanityFilter) Insert(word string) {
    p.root.Insert(word)
}

func (p *ProfanityFilter) Contains(text string) bool {
    return p.root.Contains(text)
}

// Inserts word into filter
func (t *TrieNode) Insert(word string) {
    current := t
    for _, char := range strings.ToLower(word) {
        if current.children[char] == nil {
            current.children[char] = &TrieNode{
                children: make(map[rune]*TrieNode),
            }
        }
        current = current.children[char]
    }
    current.isEnd = true
}

// Checks if text contains a certain substring
func (t *TrieNode) Contains(text string) bool {
    text = strings.ToLower(ObfuscateText(text))
    for i := 0; i < len(text); i++ {
        node := t
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
        "4", "a",
        "3", "e",
    )
    return replacer.Replace(text)
}

// Replace characters
func ReplaceCharacters(text string) string {
    rand.Seed(time.Now().UnixNano())

    replacements := map[rune]rune{
        'o': '0',
        'i': '1',
        'a': '4',
        'e': '3',
        't': '7',
        's': '5',
        'b': '8',
        'g': '6',
    }

    runes := []rune(text)
    indexes := []int{}

    // Collect all indexes that can be replaced
    for i, r := range runes {
        if _, ok := replacements[r]; ok {
            indexes = append(indexes, i)
        }
    }

    if len(indexes) == 0 {
        return text // Nothing to replace
    }

    // Pick random index to replace
    index := indexes[rand.Intn(len(indexes))]
    runes[index] = replacements[runes[index]]

    return string(runes)
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