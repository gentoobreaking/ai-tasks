package gis

import (
	"context"
)

// GISSource defines the interface for GIS data sources
type GISSource interface {
	// DownloadParcel downloads parcel data for a given area
	DownloadParcel(ctx context.Context, county, district, section, landNumber string) ([]byte, error)
	// DownloadRoad downloads road data for a given bounding box
	DownloadRoad(ctx context.Context, bbox BoundingBox) ([]byte, error)
	// GetSourceName returns the source identifier
	GetSourceName() string
	// GetSourceVersion returns the version of the source data
	GetSourceVersion() string
}

// LandSurveyAdapter adapts the Land Survey (國土測繪圖資服務雲) API
type LandSurveyAdapter struct {
	downloader *GISDownloader
	version    string
}

// NewLandSurveyAdapter creates a new LandSurveyAdapter
func NewLandSurveyAdapter(baseURL, cacheDir string) *LandSurveyAdapter {
	return &LandSurveyAdapter{
		downloader: NewGISDownloader(baseURL, cacheDir, DefaultMaxRetries),
		version:    "1.0",
	}
}

func (a *LandSurveyAdapter) DownloadParcel(ctx context.Context, county, district, section, landNumber string) ([]byte, error) {
	return a.downloader.DownloadParcelGeoJSON(ctx, county, district, section, landNumber)
}

func (a *LandSurveyAdapter) DownloadRoad(ctx context.Context, bbox BoundingBox) ([]byte, error) {
	return a.downloader.DownloadRoadGeoJSON(ctx, bbox)
}

func (a *LandSurveyAdapter) GetSourceName() string {
	return "LAND_SURVEY"
}

func (a *LandSurveyAdapter) GetSourceVersion() string {
	return a.version
}

// LandRegistryAdapter adapts the Land Registry (地籍圖資網路便民服務系統) API
type LandRegistryAdapter struct {
	downloader *GISDownloader
	version    string
}

// NewLandRegistryAdapter creates a new LandRegistryAdapter
func NewLandRegistryAdapter(baseURL, cacheDir string) *LandRegistryAdapter {
	return &LandRegistryAdapter{
		downloader: NewGISDownloader(baseURL, cacheDir, DefaultMaxRetries),
		version:    "1.0",
	}
}

func (a *LandRegistryAdapter) DownloadParcel(ctx context.Context, county, district, section, landNumber string) ([]byte, error) {
	return a.downloader.DownloadParcelGeoJSON(ctx, county, district, section, landNumber)
}

func (a *LandRegistryAdapter) DownloadRoad(ctx context.Context, bbox BoundingBox) ([]byte, error) {
	return a.downloader.DownloadRoadGeoJSON(ctx, bbox)
}

func (a *LandRegistryAdapter) GetSourceName() string {
	return "LAND_REGISTRY"
}

func (a *LandRegistryAdapter) GetSourceVersion() string {
	return a.version
}

// GISAdapterFactory creates GIS adapters
type GISAdapterFactory struct {
	landSurveyBaseURL  string
	landRegistryBaseURL string
	cacheDir           string
}

// NewGISAdapterFactory creates a new factory
func NewGISAdapterFactory(landSurveyBaseURL, landRegistryBaseURL, cacheDir string) *GISAdapterFactory {
	return &GISAdapterFactory{
		landSurveyBaseURL:   landSurveyBaseURL,
		landRegistryBaseURL: landRegistryBaseURL,
		cacheDir:            cacheDir,
	}
}

// CreateLandSurveyAdapter creates a LandSurveyAdapter
func (f *GISAdapterFactory) CreateLandSurveyAdapter() *LandSurveyAdapter {
	return NewLandSurveyAdapter(f.landSurveyBaseURL, f.cacheDir)
}

// CreateLandRegistryAdapter creates a LandRegistryAdapter
func (f *GISAdapterFactory) CreateLandRegistryAdapter() *LandRegistryAdapter {
	return NewLandRegistryAdapter(f.landRegistryBaseURL, f.cacheDir)
}