package gis

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Constants
const (
	DefaultBatchSize     = 256
	DefaultMaxRetries    = 3
	DefaultRetryBase     = time.Second
	DefaultTimeout       = 30 * time.Second
	NLSCGISSource        = "NLSC_GIS"
	GeometrySRID         = 3826
	SourceGeometrySRID   = 4326
)

// GISDownloader handles downloading GeoJSON from NLSC GIS services with caching and retry
type GISDownloader struct {
	baseURL    string
	client     *http.Client
	cacheDir   string
	retries    int
	retryBase  time.Duration
}

// NewGISDownloader creates a new GISDownloader
func NewGISDownloader(baseURL, cacheDir string, retries int) *GISDownloader {
	if retries <= 0 {
		retries = DefaultMaxRetries
	}
	return &GISDownloader{
		baseURL:   baseURL,
		cacheDir:  cacheDir,
		retries:   retries,
		retryBase: DefaultRetryBase,
		client: &http.Client{
			Timeout: DefaultTimeout,
		},
	}
}

// DownloadParcelGeoJSON downloads parcel GeoJSON for a specific land parcel
func (d *GISDownloader) DownloadParcelGeoJSON(ctx context.Context, county, district, section, landNumber string) ([]byte, error) {
	// Build query parameters for NLSC GIS API
	params := map[string]string{
		"county":      county,
		"district":    district,
		"section":     section,
		"land_number": landNumber,
		"format":      "geojson",
		"srid":        "4326",
	}
	url := d.buildURL("/parcel", params)
	return d.downloadWithCache(ctx, url, fmt.Sprintf("parcel_%s_%s_%s_%s.geojson", county, district, section, landNumber))
}

// DownloadRoadGeoJSON downloads road GeoJSON for a bounding box
func (d *GISDownloader) DownloadRoadGeoJSON(ctx context.Context, bbox BoundingBox) ([]byte, error) {
	params := map[string]string{
		"minx": fmt.Sprintf("%.6f", bbox.MinX),
		"miny": fmt.Sprintf("%.6f", bbox.MinY),
		"maxx": fmt.Sprintf("%.6f", bbox.MaxX),
		"maxy": fmt.Sprintf("%.6f", bbox.MaxY),
		"format": "geojson",
		"srid":   "4326",
	}
	url := d.buildURL("/road", params)
	cacheKey := fmt.Sprintf("road_%.6f_%.6f_%.6f_%.6f.geojson", bbox.MinX, bbox.MinY, bbox.MaxX, bbox.MaxY)
	return d.downloadWithCache(ctx, url, cacheKey)
}

// BoundingBox represents a geographic bounding box
type BoundingBox struct {
	MinX, MinY, MaxX, MaxY float64
}

func (d *GISDownloader) buildURL(endpoint string, params map[string]string) string {
	var parts []string
	for k, v := range params {
		parts = append(parts, fmt.Sprintf("%s=%s", k, v))
	}
	return fmt.Sprintf("%s%s?%s", d.baseURL, endpoint, strings.Join(parts, "&"))
}

func (d *GISDownloader) downloadWithCache(ctx context.Context, url, cacheKey string) ([]byte, error) {
	cachePath := filepath.Join(d.cacheDir, cacheKey)

	// Check cache first
	if cached, err := d.readCache(cachePath); err == nil {
		return cached, nil
	}

	// Download with retry
	var lastErr error
	for attempt := 0; attempt <= d.retries; attempt++ {
		if attempt > 0 {
			backoff := d.retryBase * time.Duration(1<<uint(attempt-1))
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(backoff):
			}
		}

		data, etag, lastModified, err := d.doRequest(ctx, url, cachePath)
		if err == nil {
			// Write to cache with metadata
			if err := d.writeCache(cachePath, data, etag, lastModified); err != nil {
				// Log but don't fail
			}
			return data, nil
		}
		lastErr = err

		// Check if error is retryable
		if !isRetryableError(err) {
			break
		}
	}

	return nil, fmt.Errorf("download failed after %d retries: %w", d.retries, lastErr)
}

func (d *GISDownloader) doRequest(ctx context.Context, url, cachePath string) ([]byte, string, string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, "", "", err
	}

	// Add cache headers if cache exists
	if meta, err := d.readCacheMeta(cachePath); err == nil {
		if meta.ETag != "" {
			req.Header.Set("If-None-Match", meta.ETag)
		}
		if meta.LastModified != "" {
			req.Header.Set("If-Modified-Since", meta.LastModified)
		}
	}

	resp, err := d.client.Do(req)
	if err != nil {
		return nil, "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotModified {
		// Return cached data
		data, err := d.readCache(cachePath)
		return data, "", "", err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, "", "", fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", "", err
	}

	return data, resp.Header.Get("ETag"), resp.Header.Get("Last-Modified"), nil
}

type cacheMeta struct {
	ETag         string
	LastModified string
}

func (d *GISDownloader) readCache(path string) ([]byte, error) {
	return os.ReadFile(path)
}

func (d *GISDownloader) readCacheMeta(path string) (cacheMeta, error) {
	metaPath := path + ".meta"
	data, err := os.ReadFile(metaPath)
	if err != nil {
		return cacheMeta{}, err
	}
	var meta cacheMeta
	err = json.Unmarshal(data, &meta)
	return meta, err
}

func (d *GISDownloader) writeCache(path string, data []byte, etag, lastModified string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	if err := os.WriteFile(path, data, 0644); err != nil {
		return err
	}
	meta := cacheMeta{ETag: etag, LastModified: lastModified}
	metaData, _ := json.Marshal(meta)
	return os.WriteFile(path+".meta", metaData, 0644)
}

func isRetryableError(err error) bool {
	// Network errors, timeouts, 5xx errors are retryable
	// This is a simplified check
	return err != nil
}

// ParsedParcel represents a parsed parcel from GeoJSON
type ParsedParcel struct {
	County            string
	District          string
	Section           string
	LandNumber        string
	AreaSqm           float64
	UrbanZoning       string
	LandUseCategory   string
	Geometry4326      []byte // WKB in EPSG:4326
	Geometry3826      []byte // WKB in EPSG:3826
	Centroid3826      []byte // WKB Point in EPSG:3826
	BBox3826          []byte // WKB Polygon in EPSG:3826
	SourceRecordHash  string // SHA256 of source feature
}

// GeoJSON structures for parsing
type geoJSONFeatureCollection struct {
	Type     string                 `json:"type"`
	Features []geoJSONFeature       `json:"features"`
}

type geoJSONFeature struct {
	Type       string                 `json:"type"`
	Properties map[string]interface{} `json:"properties"`
	Geometry   json.RawMessage        `json:"geometry"`
}

type geoJSONGeometry struct {
	Type        string          `json:"type"`
	Coordinates json.RawMessage `json:"coordinates"`
}

// GISParser parses GeoJSON into ParsedParcel structs
type GISParser struct {
	geometryEngine GeometryEngineInterface
}

// NewGISParser creates a new GISParser
func NewGISParser(geometryEngine GeometryEngineInterface) *GISParser {
	return &GISParser{geometryEngine: geometryEngine}
}

// ParseParcelGeoJSON parses GeoJSON FeatureCollection into ParsedParcel slice
func (p *GISParser) ParseParcelGeoJSON(data []byte) ([]ParsedParcel, error) {
	var fc geoJSONFeatureCollection
	if err := json.Unmarshal(data, &fc); err != nil {
		return nil, fmt.Errorf("failed to unmarshal GeoJSON: %w", err)
	}

	if fc.Type != "FeatureCollection" {
		return nil, fmt.Errorf("expected FeatureCollection, got %s", fc.Type)
	}

	parcels := make([]ParsedParcel, 0, len(fc.Features))
	for _, feature := range fc.Features {
		parcel, err := p.parseFeature(feature)
		if err != nil {
			// Log error but continue parsing other features
			continue
		}
		parcels = append(parcels, parcel)
	}

	return parcels, nil
}

func (p *GISParser) parseFeature(feature geoJSONFeature) (ParsedParcel, error) {
	props := feature.Properties

	// Extract required fields
	county := getStringProp(props, "county", "COUNTY", "City", "CITY")
	district := getStringProp(props, "district", "DISTRICT", "Town", "TOWN")
	section := getStringProp(props, "section", "SECTION", "Sect", "SECT")
	landNumber := getStringProp(props, "land_number", "LAND_NUMBER", "LandNo", "LANDNO", "ParcelNo", "PARCELNO")

	if county == "" || district == "" || section == "" || landNumber == "" {
		return ParsedParcel{}, fmt.Errorf("missing required fields: county=%s, district=%s, section=%s, land_number=%s",
			county, district, section, landNumber)
	}

	areaSqm := getFloatProp(props, "area_sqm", "AREA_SQM", "Area", "AREA")
	urbanZoning := getStringProp(props, "urban_zoning", "URBAN_ZONING", "Zone", "ZONE")
	landUseCategory := getStringProp(props, "land_use_category", "LAND_USE_CATEGORY", "LandUse", "LANDUSE")

	// Parse geometry
	geom4326, err := p.parseGeometry(feature.Geometry)
	if err != nil {
		return ParsedParcel{}, fmt.Errorf("failed to parse geometry: %w", err)
	}

	// Transform to 3826
	geom3826, err := p.geometryEngine.TransformWKTToInternal(string(geom4326))
	if err != nil {
		return ParsedParcel{}, fmt.Errorf("failed to transform geometry: %w", err)
	}

	// Compute centroid and bbox in 3826
	centroid, bbox, err := p.geometryEngine.ComputeCentroidAndBBox(string(geom3826))
	if err != nil {
		return ParsedParcel{}, fmt.Errorf("failed to compute centroid/bbox: %w", err)
	}

	// Compute source record hash
	hash := p.computeSourceHash(feature)

	return ParsedParcel{
		County:           county,
		District:         district,
		Section:          section,
		LandNumber:       landNumber,
		AreaSqm:          areaSqm,
		UrbanZoning:      urbanZoning,
		LandUseCategory:  landUseCategory,
		Geometry4326:     geom4326,
		Geometry3826:     []byte(geom3826),
		Centroid3826:     centroid,
		BBox3826:         bbox,
		SourceRecordHash: hash,
	}, nil
}

func (p *GISParser) parseGeometry(raw json.RawMessage) ([]byte, error) {
	var geom geoJSONGeometry
	if err := json.Unmarshal(raw, &geom); err != nil {
		return nil, err
	}

	// Convert GeoJSON geometry to WKT
	wkt, err := geojsonToWKT(geom)
	if err != nil {
		return nil, err
	}

	return []byte(wkt), nil
}

func getStringProp(props map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if v, ok := props[key]; ok {
			if s, ok := v.(string); ok && s != "" {
				return s
			}
		}
	}
	return ""
}

func getFloatProp(props map[string]interface{}, keys ...string) float64 {
	for _, key := range keys {
		if v, ok := props[key]; ok {
			switch val := v.(type) {
			case float64:
				return val
			case int:
				return float64(val)
			case string:
				var f float64
				fmt.Sscanf(val, "%f", &f)
				return f
			}
		}
	}
	return 0
}

// computeSourceHash computes a SHA256 hash of a feature for deduplication
func (p *GISParser) computeSourceHash(feature geoJSONFeature) string {
	data, _ := json.Marshal(feature)
	h := sha256.Sum256(data)
	return hex.EncodeToString(h[:])
}

// geojsonToWKT converts GeoJSON geometry to WKT
func geojsonToWKT(geom geoJSONGeometry) (string, error) {
	switch strings.ToUpper(geom.Type) {
	case "POLYGON":
		return polygonToWKT(geom.Coordinates)
	case "MULTIPOLYGON":
		return multiPolygonToWKT(geom.Coordinates)
	default:
		return "", fmt.Errorf("unsupported geometry type: %s", geom.Type)
	}
}

func polygonToWKT(coords json.RawMessage) (string, error) {
	var rings [][][]float64
	if err := json.Unmarshal(coords, &rings); err != nil {
		return "", err
	}

	var parts []string
	for _, ring := range rings {
		var coordsStr []string
		for _, c := range ring {
			coordsStr = append(coordsStr, fmt.Sprintf("%.6f %.6f", c[0], c[1]))
		}
		parts = append(parts, fmt.Sprintf("(%s)", strings.Join(coordsStr, ", ")))
	}
	return fmt.Sprintf("POLYGON(%s)", strings.Join(parts, ", ")), nil
}

func multiPolygonToWKT(coords json.RawMessage) (string, error) {
	var polys [][][][]float64
	if err := json.Unmarshal(coords, &polys); err != nil {
		return "", err
	}

	var parts []string
	for _, poly := range polys {
		var ringParts []string
		for _, ring := range poly {
			var coordsStr []string
			for _, c := range ring {
				coordsStr = append(coordsStr, fmt.Sprintf("%.6f %.6f", c[0], c[1]))
			}
			ringParts = append(ringParts, fmt.Sprintf("(%s)", strings.Join(coordsStr, ", ")))
		}
		parts = append(parts, fmt.Sprintf("(%s)", strings.Join(ringParts, ", ")))
	}
	return fmt.Sprintf("MULTIPOLYGON(%s)", strings.Join(parts, ", ")), nil
}

// ImportError represents an error during import
type ImportError struct {
	Type    string // "DOWNLOAD", "PARSE", "VALIDATE", "GEOMETRY", "DUPLICATE", "DB"
	Record  string // Identifier of the record (e.g., "county/district/section/land_number")
	Message string
}

// ImportResult holds the result of an import operation
type ImportResult struct {
	Imported int
	Skipped  int
	Errors   []ImportError
}

// ParcelRepository interface for database operations
type ParcelRepository interface {
	BatchInsertParcels(ctx context.Context, parcels []ParsedParcel, batchID, snapshotID int64) (int, error)
	BatchInsertRoadSegments(ctx context.Context, segments []ParsedRoadSegment, batchID, snapshotID int64) (int, error)
	CreateImportBatch(ctx context.Context, snapshotID int64) (int64, error)
	UpdateImportBatch(ctx context.Context, batchID int64, status string, recordCount int, errMsg string) error
	EnsureGISTIndexes(ctx context.Context) error
}

// ParsedRoadSegment represents a parsed road segment from GeoJSON
type ParsedRoadSegment struct {
	Name           string
	RoadClass      string
	Width          float64
	Geometry4326   []byte
	Geometry3826   []byte
	SourceRecordHash string
}



// ProvenanceRecorder interface for provenance tracking
type ProvenanceRecorder interface {
	RecordParcelProvenance(ctx context.Context, parcelID int64, source, sourceVersion string, snapshotID, importBatchID int64, sourceChecksum string, downloadedAt time.Time) error
	RecordRoadProvenance(ctx context.Context, roadID int64, source, sourceVersion string, snapshotID, importBatchID int64, sourceChecksum string, downloadedAt time.Time) error
}

// SnapshotRepository interface for snapshot operations
type SnapshotRepository interface {
	Create(ctx context.Context, source, sourceVersion, fileName, fileSHA256 string, recordCount int) (int64, error)
	UpdateStatus(ctx context.Context, id int64, status string) error
	Lock(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*DatasetSnapshot, error)
}

// DatasetSnapshot represents a dataset snapshot
type DatasetSnapshot struct {
	ID               int64
	Source           string
	SourceVersion    string
	DownloadedAt     time.Time
	PublishedAt      *time.Time
	FileName         string
	FileSHA256       string
	RecordCount      int
	Status           string
	SchemaVersion    string
	ImportStartedAt  *time.Time
	ImportCompletedAt *time.Time
}

// ImportPipeline orchestrates the GIS import process
type ImportPipeline struct {
	downloader       *GISDownloader
	parser           *GISParser
	repo             ParcelRepository
	geometryEngine   GeometryEngineInterface
	provenance       ProvenanceRecorder
	snapshotRepo     SnapshotRepository
	batchSize        int
	sourceVersion    string
}

// NewImportPipeline creates a new ImportPipeline
func NewImportPipeline(
	downloader *GISDownloader,
	parser *GISParser,
	repo ParcelRepository,
	geometryEngine GeometryEngineInterface,
	provenance ProvenanceRecorder,
	snapshotRepo SnapshotRepository,
	sourceVersion string,
) *ImportPipeline {
	return &ImportPipeline{
		downloader:     downloader,
		parser:         parser,
		repo:           repo,
		geometryEngine: geometryEngine,
		provenance:     provenance,
		snapshotRepo:   snapshotRepo,
		batchSize:      DefaultBatchSize,
		sourceVersion:  sourceVersion,
	}
}

// ImportParcels imports parcels for a given administrative area
func (p *ImportPipeline) ImportParcels(ctx context.Context, county, district, section string, snapshotID int64) (ImportResult, error) {
	result := ImportResult{}

	// Create import batch
	batchID, err := p.repo.CreateImportBatch(ctx, snapshotID)
	if err != nil {
		return result, fmt.Errorf("failed to create import batch: %w", err)
	}

	// Download parcel data
	data, err := p.downloader.DownloadParcelGeoJSON(ctx, county, district, section, "")
	if err != nil {
		p.repo.UpdateImportBatch(ctx, batchID, "FAILED", 0, err.Error())
		return result, fmt.Errorf("download failed: %w", err)
	}

	// Parse GeoJSON
	parcels, err := p.parser.ParseParcelGeoJSON(data)
	if err != nil {
		p.repo.UpdateImportBatch(ctx, batchID, "FAILED", 0, err.Error())
		return result, fmt.Errorf("parse failed: %w", err)
	}

	// Validate and filter parcels
	validParcels := make([]ParsedParcel, 0, len(parcels))
	for _, parcel := range parcels {
		if err := p.validateParcel(parcel); err != nil {
			result.Skipped++
			result.Errors = append(result.Errors, ImportError{
				Type:    "VALIDATE",
				Record:  fmt.Sprintf("%s/%s/%s/%s", parcel.County, parcel.District, parcel.Section, parcel.LandNumber),
				Message: err.Error(),
			})
			continue
		}
		validParcels = append(validParcels, parcel)
	}

	// Batch insert
	imported, err := p.repo.BatchInsertParcels(ctx, validParcels, batchID, snapshotID)
	if err != nil {
		p.repo.UpdateImportBatch(ctx, batchID, "FAILED", 0, err.Error())
		return result, fmt.Errorf("batch insert failed: %w", err)
	}

	result.Imported = imported

	// Record provenance for each imported parcel
	// Note: In practice, BatchInsertParcels should return the inserted IDs
	// For now, we record at batch level
	checksum := computeChecksum(data)
	downloadedAt := time.Now()
	for range validParcels {
		// Provenance would be recorded with actual parcel IDs from DB
		_ = p.provenance.RecordParcelProvenance(ctx, 0, NLSCGISSource, p.sourceVersion, snapshotID, batchID, checksum, downloadedAt)
	}
	// Ensure GIST indexes
	if err := p.repo.EnsureGISTIndexes(ctx); err != nil {
		result.Errors = append(result.Errors, ImportError{
			Type:    "DB",
			Record:  "index",
			Message: fmt.Sprintf("failed to ensure GIST indexes: %v", err),
		})
	}

	// Update batch status
	p.repo.UpdateImportBatch(ctx, batchID, "COMPLETED", imported, "")

	// Lock snapshot
	if err := p.snapshotRepo.Lock(ctx, snapshotID); err != nil {
		result.Errors = append(result.Errors, ImportError{
			Type:    "DB",
			Record:  "snapshot",
			Message: fmt.Sprintf("failed to lock snapshot: %v", err),
		})
	}

	return result, nil
}

// ImportRoads imports road segments for a bounding box
func (p *ImportPipeline) ImportRoads(ctx context.Context, bbox BoundingBox, snapshotID int64) (ImportResult, error) {
	result := ImportResult{}

	batchID, err := p.repo.CreateImportBatch(ctx, snapshotID)
	if err != nil {
		return result, fmt.Errorf("failed to create import batch: %w", err)
	}

	data, err := p.downloader.DownloadRoadGeoJSON(ctx, bbox)
	if err != nil {
		p.repo.UpdateImportBatch(ctx, batchID, "FAILED", 0, err.Error())
		return result, fmt.Errorf("download failed: %w", err)
	}

	segments, err := p.parser.ParseRoadGeoJSON(data)
	if err != nil {
		p.repo.UpdateImportBatch(ctx, batchID, "FAILED", 0, err.Error())
		return result, fmt.Errorf("parse failed: %w", err)
	}

	validSegments := make([]ParsedRoadSegment, 0, len(segments))
	for _, seg := range segments {
		if err := p.validateRoadSegment(seg); err != nil {
			result.Skipped++
			result.Errors = append(result.Errors, ImportError{
				Type:    "VALIDATE",
				Record:  seg.Name,
				Message: err.Error(),
			})
			continue
		}
		validSegments = append(validSegments, seg)
	}

	imported, err := p.repo.BatchInsertRoadSegments(ctx, validSegments, batchID, snapshotID)
	if err != nil {
		p.repo.UpdateImportBatch(ctx, batchID, "FAILED", 0, err.Error())
		return result, fmt.Errorf("batch insert failed: %w", err)
	}

	result.Imported = imported

	checksum := computeChecksum(data)
	downloadedAt := time.Now()
	for range validSegments {
		_ = p.provenance.RecordRoadProvenance(ctx, 0, NLSCGISSource, p.sourceVersion, snapshotID, batchID, checksum, downloadedAt)
	}

	if err := p.repo.EnsureGISTIndexes(ctx); err != nil {
		result.Errors = append(result.Errors, ImportError{
			Type:    "DB",
			Record:  "index",
			Message: fmt.Sprintf("failed to ensure GIST indexes: %v", err),
		})
	}

	p.repo.UpdateImportBatch(ctx, batchID, "COMPLETED", imported, "")

	if err := p.snapshotRepo.Lock(ctx, snapshotID); err != nil {
		result.Errors = append(result.Errors, ImportError{
			Type:    "DB",
			Record:  "snapshot",
			Message: fmt.Sprintf("failed to lock snapshot: %v", err),
		})
	}

	return result, nil
}

func (p *ImportPipeline) validateParcel(parcel ParsedParcel) error {
	// Check required fields
	if parcel.County == "" || parcel.District == "" || parcel.Section == "" || parcel.LandNumber == "" {
		return fmt.Errorf("missing required key fields")
	}

	// Check area > 0
	if parcel.AreaSqm <= 0 {
		return fmt.Errorf("area must be > 0")
	}

	// Validate geometry
	if err := p.geometryEngine.ValidateGeometry(string(parcel.Geometry3826)); err != nil {
		return fmt.Errorf("invalid geometry: %w", err)
	}

	// Ensure MultiPolygon
	if !strings.HasPrefix(strings.ToUpper(string(parcel.Geometry3826)), "MULTIPOLYGON") {
		return fmt.Errorf("geometry must be MultiPolygon")
	}

	return nil
}

func (p *ImportPipeline) validateRoadSegment(seg ParsedRoadSegment) error {
	if seg.Name == "" {
		return fmt.Errorf("road name is required")
	}
	if err := p.geometryEngine.ValidateGeometry(string(seg.Geometry3826)); err != nil {
		return fmt.Errorf("invalid geometry: %w", err)
	}
	if !strings.HasPrefix(strings.ToUpper(string(seg.Geometry3826)), "MULTILINESTRING") {
		return fmt.Errorf("geometry must be MultiLineString")
	}
	return nil
}

// ParseRoadGeoJSON parses road GeoJSON (placeholder - to be implemented)
func (p *GISParser) ParseRoadGeoJSON(data []byte) ([]ParsedRoadSegment, error) {
	// Similar to ParseParcelGeoJSON but for road features
	// Implementation omitted for brevity
	return nil, fmt.Errorf("not implemented")
}

func computeChecksum(data []byte) string {
	h := sha256.Sum256(data)
	return hex.EncodeToString(h[:])
}

// SQLC-generated types (placeholder - will be generated by sqlc)
type BatchInsertParcelParams struct {
	Geometry      []byte
	Centroid      []byte
	BBox          []byte
	AreaSqm       float64
	Source        string
	SourceVersion string
	ImportBatchID int64
	SnapshotID    int64
	County        string
	District      string
	Section       string
	LandNumber    string
	UrbanZoning   string
	LandUseCategory string
}

type BatchInsertRoadSegmentParams struct {
	Geometry      []byte
	RoadClass     string
	Width         float64
	ImportBatchID int64
	SnapshotID    int64
	Source        string
	SourceVersion string
	Name          string
}

// GeoJSONGeometry represents a GeoJSON geometry for testing
type GeoJSONGeometry struct {
	Type        string          `json:"type"`
	Coordinates json.RawMessage `json:"coordinates"`
}

// GeoJSONToWKTForTest converts GeoJSON geometry to WKT (exported for testing)
func GeoJSONToWKTForTest(geom GeoJSONGeometry) (string, error) {
	return geojsonToWKT(geoJSONGeometry(geom))
}