package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"awesome-taiwan-mcp/internal/models"
	"awesome-taiwan-mcp/internal/sources"
	"awesome-taiwan-mcp/internal/sources/github"
	"awesome-taiwan-mcp/internal/sources/githubrepo"
	"awesome-taiwan-mcp/internal/sources/mcpmarket"
	"awesome-taiwan-mcp/internal/sources/mcpserversorg"
	"awesome-taiwan-mcp/internal/sources/registry"
)

var (
	sourceFlag   string
	workers      int
	maxPerSource int
)

func init() {
	flag.StringVar(&sourceFlag, "source", "all", "source to crawl (github, registry, mcpserversorg, mcpmarket, all)")
	flag.IntVar(&workers, "workers", 4, "number of workers per source")
	flag.IntVar(&maxPerSource, "max-per-source", 10, "max candidates per source (0=unlimited)")
	// also support --source as --source (persistent flag mimic)
}

// setupCrawler registers all source adapters.
// It appends both modelcontextprotocol/servers and modelcontextprotocol/servers-archived
// to cover the 13+ archived reference servers (audit §2.3).
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
	if source == "" || source == "all" {
		return adapters
	}
	for _, a := range adapters {
		if a.Name() == source {
			return []sources.SourceAdapter{a}
		}
	}
	return nil
}

// discoverAndFetch demo helper (not full coordinator)
func discoverAndFetch(ctx context.Context, adapters []sources.SourceAdapter) []models.RawCandidate {
	var out []models.RawCandidate
	for _, a := range adapters {
		candidates, err := a.Discover(ctx)
		if err != nil {
			fmt.Fprintf(os.Stderr, "discover %s: %v\n", a.Name(), err)
			continue
		}
		if maxPerSource > 0 && len(candidates) > maxPerSource {
			candidates = candidates[:maxPerSource]
		}
		out = append(out, candidates...)
	}
	return out
}

func main() {
	flag.Parse()
	args := flag.Args()
	// Support subcommand "crawl" for compatibility: if first arg is "crawl", shift it
	if len(args) > 0 && args[0] == "crawl" {
		// crawl subcommand; flags already parsed before subcommand? Re-parse remaining
		// simple handling: if user runs --source mcpserversorg crawl, flags before crawl are parsed
	}
	adapters := setupCrawler()
	active := filterSources(adapters, sourceFlag)
	if active == nil {
		fmt.Fprintf(os.Stderr, "unknown source: %s (valid: github, registry, mcpserversorg, mcpmarket, all)\n", sourceFlag)
		os.Exit(1)
	}
	// If invoked as --source mcpserversorg, verify it is usable
	ctx := context.Background()
	_ = ctx
	fmt.Printf("crawler: source=%s adapters=%d\n", sourceFlag, len(active))
	for _, a := range active {
		fmt.Printf(" - %s\n", a.Name())
	}
	// Demo discover for --source mcpserversorg to prove not 403 (if network available)
	if sourceFlag == "mcpserversorg" || sourceFlag == "all" {
		_ = discoverAndFetch(ctx, active)
	}
}
