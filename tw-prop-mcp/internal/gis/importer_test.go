package gis

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"
)

func TestGISDownloader_DownloadParcelGeoJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("If-None-Match") != "" || r.Header.Get("If-Modified-Since") != "" {
			w.WriteHeader(http.StatusNotModified)
			return
		}
		w.Header().Set("ETag", `"test-etag"`)
		w.Header().Set("Last-Modified", time.Now().Format(http.TimeFormat))
		w.Header().Set("Content-Type", "application/geo+json")

		fc := geoJSONFeatureCollection{
			Type: "FeatureCollection",
			Features: []geoJSONFeature{
				{
					Type: "Feature",
					Properties: map[string]interface{}{
						"county":            "台南市",
						"district":          "安南區",
						"section":           "竹篙灣段",
						"land_number":       "123",
						"area_sqm":          1000.5,
						"urban_zoning":      "工業區",
						"land_use_category": "工業",
					},
					Geometry: json.RawMessage(`{"type":"Polygon","coordinates":[[[120.1,23.1],[120.2,23.1],[120.2,23.2],[120.1,23.2],[120.1,23.1]]]}`),
				},
			},
		}
		json.NewEncoder(w).Encode(fc)
	}))
	defer server.Close()

	cacheDir := t.TempDir()
	downloader := NewGISDownloader(server.URL, cacheDir, 3)

	ctx := context.Background()
	data, err := downloader.DownloadParcelGeoJSON(ctx, "台南市", "安南區", "竹篙灣段", "123")
	if err != nil {
		t.Fatalf("Download failed: %v", err)
	}

	if len(data) == 0 {
		t.Fatal("Expected non-empty data")
	}

	cacheFiles, _ := filepath.Glob(filepath.Join(cacheDir, "parcel_台南市_安南區_竹篙灣段_123.geojson*"))
	if len(cacheFiles) == 0 {
		t.Fatal("Cache file not created")
	}

	data2, err := downloader.DownloadParcelGeoJSON(ctx, "台南市", "安南區", "竹篙灣段", "123")
	if err != nil {
		t.Fatalf("Second download failed: %v", err)
	}

	if !bytes.Equal(data, data2) {
		t.Fatal("Cached data differs from original")
	}
}

func TestGISDownloader_DownloadRoadGeoJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/geo+json")
		fc := geoJSONFeatureCollection{
			Type: "FeatureCollection",
			Features: []geoJSONFeature{
				{
					Type: "Feature",
					Properties: map[string]interface{}{
						"name":       "中華路",
						"road_class": "省道",
						"width":      20.0,
					},
					Geometry: json.RawMessage(`{"type":"LineString","coordinates":[[120.1,23.1],[120.2,23.2]]}`),
				},
			},
		}
		json.NewEncoder(w).Encode(fc)
	}))
	defer server.Close()

	cacheDir := t.TempDir()
	downloader := NewGISDownloader(server.URL, cacheDir, 3)

	bbox := BoundingBox{MinX: 120.0, MinY: 23.0, MaxX: 120.3, MaxY: 23.3}
	data, err := downloader.DownloadRoadGeoJSON(context.Background(), bbox)
	if err != nil {
		t.Fatalf("Download failed: %v", err)
	}

	if len(data) == 0 {
		t.Fatal("Expected non-empty data")
	}
}

func TestGISDownloader_Retry(t *testing.T) {
	attempts := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		attempts++
		if attempts < 3 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/geo+json")
		fc := geoJSONFeatureCollection{
			Type:     "FeatureCollection",
			Features: []geoJSONFeature{},
		}
		json.NewEncoder(w).Encode(fc)
	}))
	defer server.Close()

	cacheDir := t.TempDir()
	downloader := NewGISDownloader(server.URL, cacheDir, 3)
	downloader.retryBase = 10 * time.Millisecond

	_, err := downloader.DownloadParcelGeoJSON(context.Background(), "縣", "市", "段", "1")
	if err != nil {
		t.Fatalf("Download should succeed after retries: %v", err)
	}

	if attempts != 3 {
		t.Errorf("Expected 3 attempts, got %d", attempts)
	}
}

func TestGISParser_ParseParcelGeoJSON(t *testing.T) {
	mockEngine := &MockGeometryEngine{}
	parser := NewGISParser(mockEngine)
	geojson := []byte(`{
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"properties": {
					"county": "台南市",
					"district": "安南區",
					"section": "竹篙灣段",
					"land_number": "123",
					"area_sqm": 1000.5,
					"urban_zoning": "工業區",
					"land_use_category": "工業"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [[[120.1,23.1],[120.2,23.1],[120.2,23.2],[120.1,23.2],[120.1,23.1]]]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"county": "台南市",
					"district": "安南區",
					"section": "竹篙灣段",
					"land_number": "124",
					"area_sqm": 2000.0,
					"urban_zoning": "住宅區",
					"land_use_category": "住宅"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [[[120.3,23.3],[120.4,23.3],[120.4,23.4],[120.3,23.4],[120.3,23.3]]]
				}
			}
		]
	}`)

	parcels, err := parser.ParseParcelGeoJSON(geojson)
	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	if len(parcels) != 2 {
		t.Fatalf("Expected 2 parcels, got %d", len(parcels))
	}

	p1 := parcels[0]
	if p1.County != "台南市" || p1.District != "安南區" || p1.Section != "竹篙灣段" || p1.LandNumber != "123" {
		t.Errorf("Parcel 1 fields mismatch: %+v", p1)
	}
	if p1.AreaSqm != 1000.5 {
		t.Errorf("Expected area 1000.5, got %f", p1.AreaSqm)
	}
	if p1.UrbanZoning != "工業區" {
		t.Errorf("Expected urban_zoning 工業區, got %s", p1.UrbanZoning)
	}
	if p1.SourceRecordHash == "" {
		t.Error("SourceRecordHash should not be empty")
	}

	p2 := parcels[1]
	if p2.LandNumber != "124" {
		t.Errorf("Expected land_number 124, got %s", p2.LandNumber)
	}
	if p2.AreaSqm != 2000.0 {
		t.Errorf("Expected area 2000.0, got %f", p2.AreaSqm)
	}
}

func TestGISParser_ParseParcelGeoJSON_MissingFields(t *testing.T) {
	mockEngine := &MockGeometryEngine{}
	parser := NewGISParser(mockEngine)
	geojson := []byte(`{
		"type": "FeatureCollection",
		"features": [{
			"type": "Feature",
			"properties": {
				"district": "安南區",
				"section": "竹篙灣段",
				"land_number": "123"
			},
			"geometry": {"type":"Polygon","coordinates":[[[120.1,23.1],[120.2,23.1],[120.2,23.2],[120.1,23.2],[120.1,23.1]]]}
		}]
	}`)

	parcels, err := parser.ParseParcelGeoJSON(geojson)
	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	if len(parcels) != 0 {
		t.Errorf("Expected 0 parcels (skipped invalid), got %d", len(parcels))
	}
}

func TestGISParser_ParseParcelGeoJSON_MultiPolygon(t *testing.T) {
	mockEngine := &MockGeometryEngine{}
	parser := NewGISParser(mockEngine)
	geojson := []byte(`{
		"type": "FeatureCollection",
		"features": [{
			"type": "Feature",
			"properties": {
				"county": "台南市",
				"district": "安南區",
				"section": "竹篙灣段",
				"land_number": "125",
				"area_sqm": 5000.0
			},
			"geometry": {
				"type": "MultiPolygon",
				"coordinates": [
					[[[120.1,23.1],[120.2,23.1],[120.2,23.2],[120.1,23.2],[120.1,23.1]]],
					[[[120.3,23.3],[120.4,23.3],[120.4,23.4],[120.3,23.4],[120.3,23.3]]]
				]
			}
		}]
	}`)

	parcels, err := parser.ParseParcelGeoJSON(geojson)
	if err != nil {
		t.Fatalf("Parse failed: %v", err)
	}

	if len(parcels) != 1 {
		t.Fatalf("Expected 1 parcel, got %d", len(parcels))
	}

	if len(parcels[0].Geometry4326) == 0 {
		t.Error("Geometry4326 should not be empty")
	}
}

func TestGISParser_computeSourceHash(t *testing.T) {
	mockEngine := &MockGeometryEngine{}
	parser := NewGISParser(mockEngine)
	feature := geoJSONFeature{
		Type: "Feature",
		Properties: map[string]interface{}{
			"county": "台南市",
		},
		Geometry: json.RawMessage(`{"type":"Point","coordinates":[120.1,23.1]}`),
	}

	hash1 := parser.computeSourceHash(feature)
	hash2 := parser.computeSourceHash(feature)

	if hash1 != hash2 {
		t.Error("Hash should be deterministic")
	}
	if len(hash1) != 64 {
		t.Errorf("Expected 64 char hash, got %d", len(hash1))
	}
}

func TestParseParcelGeoJSON_InvalidGeoJSON(t *testing.T) {
	parser := NewGISParser(nil)

	_, err := parser.ParseParcelGeoJSON([]byte(`invalid json`))
	if err == nil {
		t.Error("Expected error for invalid JSON")
	}
}

func TestParseParcelGeoJSON_NotFeatureCollection(t *testing.T) {
	parser := NewGISParser(nil)

	_, err := parser.ParseParcelGeoJSON([]byte(`{"type":"Feature","properties":{}}`))
	if err == nil {
		t.Error("Expected error for non-FeatureCollection")
	}
}

func TestGeojsonToWKT_Polygon(t *testing.T) {
	geom := geoJSONGeometry{
		Type:        "Polygon",
		Coordinates: json.RawMessage(`[[[120.1,23.1],[120.2,23.1],[120.2,23.2],[120.1,23.2],[120.1,23.1]]]`),
	}

	wkt, err := geojsonToWKT(geom)
	if err != nil {
		t.Fatalf("Conversion failed: %v", err)
	}

	expected := "POLYGON((120.100000 23.100000, 120.200000 23.100000, 120.200000 23.200000, 120.100000 23.200000, 120.100000 23.100000))"
	if wkt != expected {
		t.Errorf("WKT mismatch:\nGot:      %s\nExpected: %s", wkt, expected)
	}
}

func TestGeojsonToWKT_MultiPolygon(t *testing.T) {
	geom := geoJSONGeometry{
		Type: "MultiPolygon",
		Coordinates: json.RawMessage(`[[[[120.1,23.1],[120.2,23.1],[120.2,23.2],[120.1,23.2],[120.1,23.1]]],[[[120.3,23.3],[120.4,23.3],[120.4,23.4],[120.3,23.4],[120.3,23.3]]]]`),
	}

	wkt, err := geojsonToWKT(geom)
	if err != nil {
		t.Fatalf("Conversion failed: %v", err)
	}

	if len(wkt) == 0 || !bytes.HasPrefix([]byte(wkt), []byte("MULTIPOLYGON")) {
		t.Errorf("Expected MULTIPOLYGON, got: %s", wkt)
	}
}

func TestGeojsonToWKT_UnsupportedType(t *testing.T) {
	geom := geoJSONGeometry{
		Type:        "Point",
		Coordinates: json.RawMessage(`[120.1,23.1]`),
	}

	_, err := geojsonToWKT(geom)
	if err == nil {
		t.Error("Expected error for unsupported type")
	}
}

func TestGetStringProp(t *testing.T) {
	props := map[string]interface{}{
		"county":  "台南市",
		"DISTRICT": "安南區",
	}

	result := getStringProp(props, "COUNTY", "county")
	if result != "台南市" {
		t.Errorf("Expected 台南市, got %s", result)
	}

	result = getStringProp(props, "district", "DISTRICT")
	if result != "安南區" {
		t.Errorf("Expected 安南區, got %s", result)
	}

	result = getStringProp(props, "missing")
	if result != "" {
		t.Errorf("Expected empty string for missing key, got %s", result)
	}
}

func TestGetFloatProp(t *testing.T) {
	props := map[string]interface{}{
		"area_sqm": 1000.5,
		"AREA":     2000,
		"AreaStr":  "3000.25",
	}

	result := getFloatProp(props, "AREA_SQM", "area_sqm")
	if result != 1000.5 {
		t.Errorf("Expected 1000.5, got %f", result)
	}

	result = getFloatProp(props, "area", "AREA")
	if result != 2000 {
		t.Errorf("Expected 2000, got %f", result)
	}

	result = getFloatProp(props, "AreaStr")
	if result != 3000.25 {
		t.Errorf("Expected 3000.25, got %f", result)
	}

	result = getFloatProp(props, "missing")
	if result != 0 {
		t.Errorf("Expected 0 for missing, got %f", result)
	}
}

func TestImportResult(t *testing.T) {
	result := ImportResult{
		Imported: 10,
		Skipped:  2,
		Errors: []ImportError{
			{Type: "VALIDATE", Record: "A/B/C/1", Message: "area <= 0"},
			{Type: "GEOMETRY", Record: "A/B/C/2", Message: "invalid geometry"},
		},
	}

	if result.Imported != 10 || result.Skipped != 2 || len(result.Errors) != 2 {
		t.Error("ImportResult fields not set correctly")
	}
}

func TestBoundingBox(t *testing.T) {
	bbox := BoundingBox{MinX: 120.0, MinY: 23.0, MaxX: 120.5, MaxY: 23.5}

	if bbox.MinX != 120.0 || bbox.MaxY != 23.5 {
		t.Error("BoundingBox fields not set correctly")
	}
}

type MockGeometryEngine struct {
	validateFunc func(string) error
}

func (m *MockGeometryEngine) ValidateGeometry(wkt3826 string) error {
	if m.validateFunc != nil {
		return m.validateFunc(wkt3826)
	}
	return nil
}

func (m *MockGeometryEngine) TransformWKTToInternal(wkt4326 string) (string, error) {
	return wkt4326, nil
}

func (m *MockGeometryEngine) ComputeCentroidAndBBox(wkt3826 string) ([]byte, []byte, error) {
	return []byte("centroid"), []byte("bbox"), nil
}

func TestImportPipeline_Validation(t *testing.T) {
	mockEngine := &MockGeometryEngine{
		validateFunc: func(wkt string) error {
			if wkt == "INVALID" {
				return fmt.Errorf("invalid geometry")
			}
			return nil
		},
	}

	err := mockEngine.ValidateGeometry("VALID")
	if err != nil {
		t.Errorf("Valid geometry should not error: %v", err)
	}

	err = mockEngine.ValidateGeometry("INVALID")
	if err == nil {
		t.Error("Invalid geometry should error")
	}
}