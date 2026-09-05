package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strings"

	"awesome-taiwan-mcp/internal/export"
	"awesome-taiwan-mcp/internal/models"
	"awesome-taiwan-mcp/internal/sources"
	"awesome-taiwan-mcp/internal/sources/github"
	"awesome-taiwan-mcp/internal/sources/githubrepo"
	"awesome-taiwan-mcp/internal/sources/mcpmarket"
	"awesome-taiwan-mcp/internal/sources/mcpserversorg"
	"awesome-taiwan-mcp/internal/sources/registry"
	"awesome-taiwan-mcp/internal/security"
)

var (
	// Global flags
	sourceFlag        string
	workers           int
	maxPerSource      int
	dbPath            string
	configPath        string
	jsonOutput        bool
	maliciousReport   bool
	maliciousDir      string
	maliciousThreshold string
	versionFlag       bool
)

func init() {
	flag.StringVar(&sourceFlag, "source", "all", "source to crawl (github, registry, mcpserversorg, mcpmarket, all)")
	flag.IntVar(&workers, "workers", 4, "number of workers per source")
	flag.IntVar(&maxPerSource, "max-per-source", 10, "max candidates per source (0=unlimited)")
	flag.StringVar(&dbPath, "db", "./data/registry.db", "SQLite database path")
	flag.StringVar(&configPath, "config", "", "config file path (optional)")
	flag.BoolVar(&jsonOutput, "json", false, "output as JSON")
	flag.BoolVar(&maliciousReport, "malicious-report", true, "generate malicious repository report")
	flag.StringVar(&maliciousDir, "malicious-dir", "registry/malicious", "malicious report output directory")
	flag.StringVar(&maliciousThreshold, "malicious-threshold", "MEDIUM", "minimum risk level for blocklist (LOW, MEDIUM, HIGH, CRITICAL)")
	flag.BoolVar(&versionFlag, "version", false, "print version and exit")
}

// CrawlOptions holds options for crawling.
type CrawlOptions struct {
	Source           string
	Workers          int
	MaxPerSource     int
	DBPath           string
	ConfigPath       string
	MaliciousReport  bool
	MaliciousDir     string
	MaliciousThreshold security.RiskLevel
}

// setupCrawler registers all source adapters.
func setupCrawler() []sources.SourceAdapter {
	token := os.Getenv("GITHUB_TOKEN")
	var adapters []sources.SourceAdapter
	adapters = append(adapters, github.New(token))
	adapters = append(adapters, githubrepo.New("modelcontextprotocol/servers", token))
	adapters = append(adapters, githubrepo.New("modelcontextprotocol/servers-archived", token))
	adapters = append(adapters, registry.New())
	adapters = append(adapters, mcpserversorg.New())
	adapters = append(adapters, mcpmarket.New())
	return adapters
}

// filterSources returns adapters matching the source flag.
func filterSources(adapters []sources.SourceAdapter, source string) []sources.SourceAdapter {
	switch source {
	case "all":
		return adapters
	case "github":
		var filtered []sources.SourceAdapter
		for _, a := range adapters {
			if strings.HasPrefix(a.Name(), "github") || strings.HasPrefix(a.Name(), "GitHub") {
				filtered = append(filtered, a)
			}
		}
		return filtered
	case "registry":
		var filtered []sources.SourceAdapter
		for _, a := range adapters {
			if strings.Contains(strings.ToLower(a.Name()), "registry") {
				filtered = append(filtered, a)
			}
		}
		return filtered
	case "mcpserversorg":
		var filtered []sources.SourceAdapter
		for _, a := range adapters {
			if strings.Contains(strings.ToLower(a.Name()), "mcpservers") {
				filtered = append(filtered, a)
			}
		}
		return filtered
	case "mcpmarket":
		var filtered []sources.SourceAdapter
		for _, a := range adapters {
			if strings.Contains(strings.ToLower(a.Name()), "mcpmarket") {
				filtered = append(filtered, a)
			}
		}
		return filtered
	default:
		return nil
	}
}

// discoverAndFetch demo helper (not full coordinator).
func discoverAndFetch(ctx context.Context, adapters []sources.SourceAdapter) []models.RawCandidate {
	var allCandidates []models.RawCandidate
	for _, a := range adapters {
		candidates, err := a.Discover(ctx)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Discover error from %s: %v\n", a.Name(), err)
			continue
		}
		for _, c := range candidates {
			record, err := a.Fetch(ctx, c)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Fetch error from %s: %v\n", a.Name(), err)
				continue
			}
			// Extract RawCandidate from RawRecord
			allCandidates = append(allCandidates, record.RawCandidate)
		}
	}
	return allCandidates
}

// generateMaliciousReport generates malicious detection report.
func generateMaliciousReport(entities []*models.Entity, opts CrawlOptions) error {
	if !opts.MaliciousReport {
		return nil
	}

	// Create output directory
	outputDir := opts.MaliciousDir
	if outputDir == "" {
		outputDir = "registry/malicious"
	}

	exporter := export.NewMaliciousExporter(entities, outputDir)
	return exporter.Export()
}

func main() {
	flag.Parse()
	args := flag.Args()

	if versionFlag {
		fmt.Println("awesome-taiwan-mcp v1.0.0")
		return
	}

	// Parse malicious threshold
	threshold := security.RiskLevelMedium
	switch strings.ToUpper(maliciousThreshold) {
	case "LOW":
		threshold = security.RiskLevelLow
	case "MEDIUM":
		threshold = security.RiskLevelMedium
	case "HIGH":
		threshold = security.RiskLevelHigh
	case "CRITICAL":
		threshold = security.RiskLevelCritical
	}

	// Support subcommand "crawl" for compatibility
	if len(args) > 0 && args[0] == "crawl" {
		// crawl subcommand
		runCrawl(CrawlOptions{
			Source:           sourceFlag,
			Workers:          workers,
			MaxPerSource:     maxPerSource,
			DBPath:           dbPath,
			ConfigPath:       configPath,
			MaliciousReport:  maliciousReport,
			MaliciousDir:     maliciousDir,
			MaliciousThreshold: threshold,
		})
		return
	}

	if len(args) > 0 && args[0] == "export" {
		runExport(CrawlOptions{
			Source:           sourceFlag,
			Workers:          workers,
			MaxPerSource:     maxPerSource,
			DBPath:           dbPath,
			ConfigPath:       configPath,
			MaliciousReport:  maliciousReport,
			MaliciousDir:     maliciousDir,
			MaliciousThreshold: threshold,
		})
		return
	}

	// Default: show help
	fmt.Println("Usage: crawler [flags] <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  crawl          Run full crawl pipeline")
	fmt.Println("  export         Export registry (JSON + malicious report)")
	fmt.Println("  verify         Run verification only")
	fmt.Println("  dedupe         Run deduplication only")
	fmt.Println("  score          Run quality scoring only")
	fmt.Println("  stats          Show registry statistics")
	fmt.Println("  search <query> Search registry")
	fmt.Println()
	fmt.Println("Flags:")
	flag.PrintDefaults()
}

// runCrawl executes the crawl command.
func runCrawl(opts CrawlOptions) {
	ctx := context.Background()
	adapters := setupCrawler()
	active := filterSources(adapters, opts.Source)
	if active == nil {
		fmt.Fprintf(os.Stderr, "unknown source: %s (valid: github, registry, mcpserversorg, mcpmarket, all)\n", opts.Source)
		os.Exit(1)
	}

	fmt.Printf("crawler: source=%s adapters=%d\n", opts.Source, len(active))
	for _, a := range active {
		fmt.Printf(" - %s\n", a.Name())
	}

	// Run discover and fetch
	candidates := discoverAndFetch(ctx, active)
	fmt.Printf("Discovered %d candidates\n", len(candidates))

	// TODO: Full pipeline (normalize, dedupe, classify, verify, score, persist)
	// For now, convert to entities for malicious detection demo
	entities := convertToEntities(candidates)

	// Generate malicious report
	if err := generateMaliciousReport(entities, opts); err != nil {
		fmt.Fprintf(os.Stderr, "Malicious report generation failed: %v\n", err)
	} else if opts.MaliciousReport {
		fmt.Printf("Malicious report generated in: %s\n", opts.MaliciousDir)
	}
}

// runExport executes the export command.
func runExport(opts CrawlOptions) {
	ctx := context.Background()
	adapters := setupCrawler()
	active := filterSources(adapters, opts.Source)
	if active == nil {
		fmt.Fprintf(os.Stderr, "unknown source: %s (valid: github, registry, mcpserversorg, mcpmarket, all)\n", opts.Source)
		os.Exit(1)
	}

	fmt.Printf("Exporting from source=%s\n", opts.Source)

	// Run discover and fetch
	candidates := discoverAndFetch(ctx, active)
	fmt.Printf("Discovered %d candidates\n", len(candidates))

	// Convert to entities
	entities := convertToEntities(candidates)

	// Generate malicious report
	if err := generateMaliciousReport(entities, opts); err != nil {
		fmt.Fprintf(os.Stderr, "Malicious report generation failed: %v\n", err)
	} else if opts.MaliciousReport {
		fmt.Printf("Malicious report generated in: %s\n", opts.MaliciousDir)
	}

	// TODO: Export registry JSON
	fmt.Println("Registry JSON export not yet implemented")
}

// convertToEntities converts raw candidates to entities for malicious detection.
func convertToEntities(candidates []models.RawCandidate) []*models.Entity {
	var entities []*models.Entity
	for _, c := range candidates {
		entity := &models.Entity{
			ID:          c.SourceURL, // Use SourceURL as ID
			Name:        c.Name,
			Description: c.Description,
			Repository: models.RepositoryInfo{
				URL:      c.RepositoryURL,
				Owner:    extractOwner(c.RepositoryURL),
				Name:     extractRepoName(c.RepositoryURL),
				CreatedAt: models.RFC3339Time{},
			},
			RawContent: "",
			SecurityStatus: models.SecurityStatusDetail{
				Status:   models.SecurityStatusClean,
				Findings: []models.SecurityFinding{},
			},
		}
		entities = append(entities, entity)
	}
	return entities
}

func extractOwner(repoURL string) string {
	// Simple extraction: github.com/owner/repo
	parts := strings.Split(strings.TrimPrefix(repoURL, "https://github.com/"), "/")
	if len(parts) >= 2 {
		return parts[0]
	}
	return "unknown"
}

func extractRepoName(repoURL string) string {
	parts := strings.Split(strings.TrimPrefix(repoURL, "https://github.com/"), "/")
	if len(parts) >= 2 {
		return parts[1]
	}
	return "unknown"
}