package models

import (
	"strings"
	"time"
)

// Status represents repository activity status.
type Status string

const (
	StatusActive   Status = "active"
	StatusInactive Status = "inactive"
	StatusArchived Status = "archived"
)

// HealthStatus represents MCP endpoint health.
type HealthStatus string

const (
	HealthHealthy   HealthStatus = "healthy"
	HealthDegraded  HealthStatus = "degraded"
	HealthUnhealthy HealthStatus = "unhealthy"
	HealthUnknown   HealthStatus = "unknown"
)

// Transport type for MCP endpoints.
type Transport string

const (
	TransportStdio          Transport = "stdio"
	TransportSSE            Transport = "sse"
	TransportStreamableHTTP Transport = "streamable-http"
)

// DataSourceType classifies data source types.
type DataSourceType string

const (
	DataSourceOfficialGovAPI DataSourceType = "official_gov_api"
	DataSourceOpenData       DataSourceType = "open_data"
	DataSourceOfficial       DataSourceType = "official"
	DataSourceCommunity      DataSourceType = "community"
)

// ValidCategories is the controlled vocabulary for server categories (§19).
var ValidCategories = []string{
	"finance", "stock", "etf", "banking", "insurance",
	"real-estate", "land", "housing",
	"government", "open-data", "legislative", "judicial", "procurement",
	"weather", "earthquake",
	"transport", "traffic", "railway", "metro", "bus",
	"logistics", "payment", "invoice", "tax",
	"company", "business",
	"healthcare", "education",
	"agriculture", "food",
	"tourism", "geography", "gis",
	"language", "traditional-chinese", "culture",
	"ecommerce", "devops", "news",
}

var validCategoriesSet = map[string]bool{
	"finance": true, "stock": true, "etf": true, "banking": true, "insurance": true,
	"real-estate": true, "land": true, "housing": true,
	"government": true, "open-data": true, "legislative": true, "judicial": true, "procurement": true,
	"weather": true, "earthquake": true,
	"transport": true, "traffic": true, "railway": true, "metro": true, "bus": true,
	"logistics": true, "payment": true, "invoice": true, "tax": true,
	"company": true, "business": true,
	"healthcare": true, "education": true,
	"agriculture": true, "food": true,
	"tourism": true, "geography": true, "gis": true,
	"language": true, "traditional-chinese": true, "culture": true,
	"ecommerce": true, "devops": true, "news": true,
}

var functionalSet = map[string]bool{
	"finance": true, "real-estate": true, "government": true, "weather": true,
	"transport": true, "healthcare": true, "education": true, "geography": true,
	"language": true, "ecommerce": true, "payment": true, "news": true,
	"search": true, "coding-agents": true, "communication": true, "databases": true,
	"knowledge": true, "legal": true, "security": true, "other": true,
}

var categoryParentMap = map[string]string{
	"stock": "finance", "etf": "finance", "banking": "finance", "insurance": "finance",
	"land": "real-estate", "housing": "real-estate",
	"open-data": "government", "legislative": "government", "judicial": "government", "procurement": "government",
	"earthquake": "weather",
	"traffic": "transport", "railway": "transport", "metro": "transport", "bus": "transport", "logistics": "transport",
	"invoice": "payment", "tax": "payment",
	"company": "ecommerce", "business": "ecommerce",
	"tourism": "geography", "gis": "geography",
	"traditional-chinese": "language", "culture": "language",
	"agriculture": "other", "food": "other", "devops": "other",
}

var categoryAliases = map[string]string{
	"finance & fintech": "finance",
	"finance-fintech":   "finance",
	"fintech":           "finance",
	"taiwan-stock":      "stock",
	"taiwan_stock":      "stock",
	"taiwan-stock-etf":  "stock",
	"open data":         "open-data",
	"traditional chinese": "traditional-chinese",
	"real estate":       "real-estate",
	"open_data":         "open-data",
}

// IsValidCategory returns true if cat is in the controlled vocabulary.
func IsValidCategory(cat string) bool {
	return validCategoriesSet[cat]
}

// ValidLevels are the Taiwan relevance levels (§14, §17).
var ValidLevels = []string{"T0", "T1", "T2", "T3", "T4", "T5"}

// IsValidLevel returns true if level is T0–T5.
func IsValidLevel(level string) bool {
	for _, l := range ValidLevels {
		if l == level {
			return true
		}
	}
	return false
}

// NormalizeCategory maps any raw category to its functional parent or "other".
func NormalizeCategory(cat string) string {
	c0 := strings.TrimSpace(strings.ToLower(cat))
	if c0 == "" {
		return "other"
	}
	if a, ok := categoryAliases[c0]; ok {
		c0 = a
	}
	c := strings.ReplaceAll(c0, " ", "-")
	c = strings.ReplaceAll(c, "_", "-")
	for strings.Contains(c, "--") {
		c = strings.ReplaceAll(c, "--", "-")
	}
	c = strings.Trim(c, "-")
	if a, ok := categoryAliases[c]; ok {
		c = a
	}
	if parent, ok := categoryParentMap[c]; ok {
		return parent
	}
	if functionalSet[c] {
		return c
	}
	if validCategoriesSet[c] {
		return "other"
	}
	return "other"
}

// NormalizeCategories deduplicates and normalizes a slice.
func NormalizeCategories(cats []string) []string {
	seen := make(map[string]bool)
	var out []string
	for _, c := range cats {
		n := NormalizeCategory(c)
		if !seen[n] {
			seen[n] = true
			out = append(out, n)
		}
	}
	if len(out) == 1 && out[0] == "other" {
		return out
	}
	filtered := out[:0]
	for _, v := range out {
		if v == "other" {
			continue
		}
		filtered = append(filtered, v)
	}
	if len(filtered) > 0 {
		return filtered
	}
	return out
}

// IsFunctionalKey reports whether key is a functional category key.
func IsFunctionalKey(key string) bool {
	return functionalSet[key]
}

// RawCandidate represents a raw MCP discovered from a source (§12).
type RawCandidate struct {
	Source        string         `json:"source"`
	SourceURL     string         `json:"source_url"`
	Name          string         `json:"name"`
	Description   string         `json:"description"`
	RepositoryURL string         `json:"repository_url"`
	HomepageURL   string         `json:"homepage_url"`
	Endpoint      string         `json:"endpoint"`
	Author        string         `json:"author"`
	RawMetadata   map[string]any `json:"raw_metadata"`
	DiscoveredAt  time.Time      `json:"discovered_at"`
}

// Prompt represents an MCP prompt (§9.3).
type Prompt struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// RawRecord is a fully fetched candidate with all metadata (§12, §16).
type RawRecord struct {
	Candidate    RawCandidate      `json:"candidate"`
	Repository   *RepositoryInfo   `json:"repository"`
	Manifest     map[string]any    `json:"manifest"`
	Tools        []Tool            `json:"tools"`
	Resources    []Resource        `json:"resources"`
	Prompts      []Prompt          `json:"prompts"`
	Endpoints    []Endpoint        `json:"endpoints"`
	Transport    []string          `json:"transport"`
	Readme       string            `json:"readme"`
	PackageFiles map[string]string `json:"package_files"`
}

// MCPServer is the normalized, classified MCP server (§13).
type MCPServer struct {
	ID              string           `json:"id"`
	Name            string           `json:"name"`
	Slug            string           `json:"slug"`
	Description     string           `json:"description"`
	Region          []string         `json:"region"`
	Category        []string         `json:"category"`
	TaiwanRelevance TaiwanRelevance  `json:"taiwan_relevance"`
	Repository      RepositoryInfo   `json:"repository"`
	Endpoints       []Endpoint       `json:"endpoints"`
	Transport       []string         `json:"transport"`
	Tools           []Tool           `json:"tools"`
	Resources       []Resource       `json:"resources,omitempty"`
	DataSources     []DataSource     `json:"data_sources"`
	License         string           `json:"license"`
	Status          Status           `json:"status"`
	Health          HealthStatus     `json:"health"`
	Quality         QualityScore     `json:"quality"`
	Sources         []SourceReference `json:"sources"`
	FirstSeen       time.Time        `json:"first_seen"`
	LastSeen        time.Time        `json:"last_seen"`
	LastVerified    time.Time        `json:"last_verified"`
}

// TaiwanRelevance holds the Taiwan classification (§14, §17).
type TaiwanRelevance struct {
	Level      string     `json:"level"`
	Score      float64    `json:"score"`
	Confidence float64    `json:"confidence"`
	Evidence   []Evidence `json:"evidence"`
}

// RepositoryInfo holds GitHub/repository metadata (§7).
type RepositoryInfo struct {
	URL           string    `json:"url"`
	Host          string    `json:"host"`
	Owner         string    `json:"owner"`
	Name          string    `json:"name"`
	Stars         int       `json:"stars"`
	Forks         int       `json:"forks"`
	Watchers      int       `json:"watchers"`
	OpenIssues    int       `json:"open_issues"`
	Language      string    `json:"language"`
	License       string    `json:"license"`
	Topics        []string  `json:"topics"`
	DefaultBranch string    `json:"default_branch"`
	Archived      bool      `json:"archived"`
	Fork          bool      `json:"fork"`
	Homepage      string    `json:"homepage"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	PushedAt      time.Time `json:"pushed_at"`
}

// Endpoint holds MCP endpoint connection info (§8).
type Endpoint struct {
	URL             string `json:"url"`
	Transport       string `json:"transport"`
	ProtocolVersion string `json:"protocol_version"`
	TLS             bool   `json:"tls"`
	Status          string `json:"status"`
}

// Tool represents an MCP tool (§9.1).
type Tool struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"input_schema"`
}

// Resource represents an MCP resource (§9.2).
type Resource struct {
	URI         string `json:"uri"`
	Name        string `json:"name"`
	Description string `json:"description"`
	MIMEType    string `json:"mime_type"`
}

// DataSource represents a data source used by the MCP (§10).
type DataSource struct {
	Name         string         `json:"name"`
	Type         DataSourceType `json:"type"`
	URL          string         `json:"url"`
	Country      string         `json:"country"`
	Official     bool           `json:"official"`
	AccessMethod string         `json:"access_method"`
}

// Evidence holds scoring rule evidence (§16, §66).
type Evidence struct {
	Type        string  `json:"type"`
	Source      string  `json:"source"`
	Location    string  `json:"location"`
	ContentHash string  `json:"content_hash"`
	MatchedText string  `json:"matched_text"`
	Rule        string  `json:"rule"`
	Score       float64 `json:"score"`
	Confidence  float64 `json:"confidence"`
}

// QualityScore holds the 100-point quality assessment (§15, §31).
type QualityScore struct {
	Score      int               `json:"score"`
	Grade      string            `json:"grade"`
	Components QualityComponents `json:"components"`
}

// QualityComponents holds the 10 scoring components (§31).
type QualityComponents struct {
	DataSource    int `json:"data_source"`
	Maintenance   int `json:"maintenance"`
	Documentation int `json:"documentation"`
	MCPCompliance int `json:"mcp_compliance"`
	ToolSchema    int `json:"tool_schema"`
	Health        int `json:"health"`
	Repository    int `json:"repository"`
	License       int `json:"license"`
	Security      int `json:"security"`
	Community     int `json:"community"`
}

// SourceReference holds discovery source info (§16, §64).
type SourceReference struct {
	Source     string  `json:"source"`
	URL        string  `json:"url"`
	TrustScore float64 `json:"trust_score"`
}

// Level thresholds (§17)
var LevelThresholds = []struct {
	MinScore float64
	Level    string
}{
	{70, "T5"},
	{55, "T4"},
	{40, "T3"},
	{20, "T2"},
	{5, "T1"},
	{0, "T0"},
}

// ScoreToLevel maps a score to its Taiwan relevance level.
func ScoreToLevel(score float64) string {
	for _, th := range LevelThresholds {
		if score >= th.MinScore {
			return th.Level
		}
	}
	return "T0"
}

// GradeForScore converts quality score to grade (§31).
func GradeForScore(score int) string {
	switch {
	case score >= 90:
		return "A"
	case score >= 80:
		return "B"
	case score >= 60:
		return "C"
	case score >= 40:
		return "D"
	default:
		return "F"
	}
}
