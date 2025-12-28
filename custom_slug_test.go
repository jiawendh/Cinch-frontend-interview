package main

import (
	"strconv"
	"strings"
	"testing"
	"url-shortener-backend/validator"
	"url-shortener-backend/types"
)

type mockProfanityFilter struct {
	blocked bool
}

func (m mockProfanityFilter) Contains(_ string) bool {
	return m.blocked
}

func TestRemoveVowels(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{"basic", "hello", "hll"},
		{"multiple", "slugtest", "slgtst"},
		{"no vowels", "rhythm", "rhythm"},
		{"empty", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := validator.RemoveVowels(tt.in)
			if got != tt.want {
				t.Errorf("RemoveVowels(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func TestGenerateSuggestions_BasicRules(t *testing.T) {
	shortLinks := map[string]*types.ShortLink{}
	profanity := mockProfanityFilter{blocked: false}
	slug := "example"

	suggestions := validator.GenerateSuggestions(slug, shortLinks, profanity)

	if len(suggestions) == 0 {
		t.Fatal("expected suggestions, got none")
	}

	if len(suggestions) > 5 {
		t.Fatalf("expected max 5 suggestions, got %d", len(suggestions))
	}

	seen := make(map[string]bool)
	for _, s := range suggestions {
		if len(s) < 3 {
			t.Errorf("suggestion too short: %q", s)
		}

		if seen[s] {
			t.Errorf("duplicate suggestion found: %q", s)
		}
		seen[s] = true
	}
}

func TestGenerateSuggestions_RandomSuffixFormat(t *testing.T) {
	shortLinks := map[string]*types.ShortLink{}
	profanity := mockProfanityFilter{blocked: false}
	slug := "test"

	suggestions := validator.GenerateSuggestions(slug, shortLinks, profanity)

	foundNumeric := false
	for _, s := range suggestions {
		if strings.HasPrefix(s, slug+"-") {
			suffix := strings.TrimPrefix(s, slug+"-")
			if _, err := strconv.Atoi(suffix); err == nil {
				foundNumeric = true
			}
		}
	}

	if !foundNumeric {
		t.Error("expected at least one numeric suffix suggestion")
	}
}

func TestValidateSlug_ProfanityOnly(t *testing.T) {
	shortLinks := map[string]*types.ShortLink{}
	profanity := mockProfanityFilter{blocked: true}
	slug := "badword"

	result := validator.ValidateSlugLogic(slug, shortLinks, profanity)

	if result.Valid {
		t.Fatal("expected invalid slug")
	}

	if result.Reason != "\"" + slug + "\" contains prohibited content" {
		t.Errorf("unexpected reason: %s", result.Reason)
	}

	if len(result.Suggestions) != 0 {
		t.Error("expected no suggestions")
	}
}

func TestValidateSlug_TakenSlug(t *testing.T) {
	shortLinks := map[string]*types.ShortLink{
		"taken": &types.ShortLink{ ShortURL: "taken" },
	}

	profanity := mockProfanityFilter{blocked: false}
	slug := "taken"

	result := validator.ValidateSlugLogic(slug, shortLinks, profanity)

	if result.Valid {
		t.Fatal("expected invalid slug due to taken slug")
	}

	if result.Reason != "\"" + slug + "\" is already taken" {
		t.Errorf("unexpected reason: %s", result.Reason)
	}

	if len(result.Suggestions) == 0 {
		t.Fatal("expected suggestions for taken slug")
	}
}

func TestValidateSlug_Valid(t *testing.T) {
	shortLinks := map[string]*types.ShortLink{}
	profanity := mockProfanityFilter{blocked: false}

	result := validator.ValidateSlugLogic("clean-slug", shortLinks, profanity)

	if !result.Valid {
		t.Fatalf("expected valid slug, got reason: %s", result.Reason)
	}

	if len(result.Suggestions) != 0 {
		t.Error("valid slug should not return suggestions")
	}
}
