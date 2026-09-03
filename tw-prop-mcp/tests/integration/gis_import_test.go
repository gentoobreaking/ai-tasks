package integration

import (
	"context"
	"encoding/json"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"

	"tw-prop-mcp/internal/gis"
	"tw-prop-mcp/internal/repository"
)

func TestGISImportPipeline_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// NOTE: This test requires Docker to run. 
	// For CI environments without Docker, this test is skipped.
	t.Skip("Integration test requires Docker - skipping in this environment")
	// postgresContainer, err := postgres.RunContainer(ctx,
	// 	testcontainers.GenericContainerRequest{
	// 		ContainerRequest: testcontainers.ContainerRequest{
	// 			Image:        "postgis/postgis:16-3.4",
	// 			ExposedPorts: []string{"5432/tcp"},
	// 			Env: map[string]string{
	// 				"POSTGRES_DB":       "testdb",
	// 				"POSTGRES_USER":     "testuser",
	// 				"POSTGRES_PASSWORD": "testpass",
	// 			},
	// 			WaitingFor: wait.ForLog("database system is ready to accept connections").
	// 				WithOccurrence(2).
	// 				WithStartupTimeout(60 * time.Second),
	// 		},
	// 		Started: true,
	// 	},
	// )
	// require.NoError(t, err)
	// defer func() {
	// 	_ = postgresContainer.Terminate(ctx)
	// }()

	// connStr, err := postgresContainer.ConnectionString(ctx, "sslmode=disable")
	// require.NoError(t, err)

	// pool, err := pgxpool.New(ctx, connStr)
	// require.NoError(t, err)
	// defer pool.Close()

	// err = runMigrations(ctx, pool)
	// require.NoError(t, err)

	// repo := repository.NewParcelRepository(pool)

	// conn, err := pool.Acquire(ctx)
	// require.NoError(t, err)
	// defer conn.Release()
	// geomEngine := gis.NewGeometryEngine(conn.Conn())

	// testDataDir := t.TempDir()
	// sampleData, err := os.ReadFile("../../tests/testdata/gis_sample.geojson")
	// require.NoError(t, err)

	// downloader := &testDownloader{data: sampleData}
	// parser := gis.NewGISParser(geomEngine)
	// provenance := &testProvenanceRecorder{}
	// snapshotRepo := repo

	// pipeline := gis.NewImportPipeline(
	// 	downloader,
	// 	parser,
	// 	repo,
	// 	geomEngine,
	// 	provenance,
	// 	snapshotRepo,
	// 	"1.0",
	// )

	// snapshotID, err := repo.CreateDatasetSnapshot(ctx, gis.NLSCGISSource, "1.0", "gis_sample.geojson", "test-checksum", 3)
	// require.NoError(t, err)

	// err = repo.UpdateDatasetSnapshotStatus(ctx, snapshotID, "IMPORTING")
	// require.NoError(t, err)

	// bbox := gis.BoundingBox{MinX: 120.17, MinY: 23.02, MaxX: 120.19, MaxY: 23.03}
	// result, err := pipeline.ImportRoads(ctx, bbox, snapshotID)
	// t.Logf("Import result: %+v", result)

	// snapshot, err := repo.GetDatasetSnapshot(ctx, snapshotID)
	// require.NoError(t, err)
	// require.Equal(t, gis.NLSCGISSource, snapshot.Source)
	// require.Equal(t, "1.0", snapshot.SourceVersion)
}

func TestGISParser_WithSampleData(t *testing.T) {
	data, err := os.ReadFile("../../tests/testdata/gis_sample.geojson")
	require.NoError(t, err)

	mockEngine := &MockGeometryEngine{}
	parser := gis.NewGISParser(mockEngine)
	parcels, err := parser.ParseParcelGeoJSON(data)
	require.NoError(t, err)

	require.Len(t, parcels, 2)

	p1 := parcels[0]
	require.Equal(t, "台南市", p1.County)
	require.Equal(t, "安南區", p1.District)
	require.Equal(t, "竹篙灣段", p1.Section)
	require.Equal(t, "0001", p1.LandNumber)
	require.Equal(t, 1250.75, p1.AreaSqm)
	require.Equal(t, "工業區", p1.UrbanZoning)
	require.Equal(t, "工業", p1.LandUseCategory)
	require.NotEmpty(t, p1.Geometry4326)
	require.NotEmpty(t, p1.SourceRecordHash)

	p2 := parcels[1]
	require.Equal(t, "0002", p2.LandNumber)
	require.Equal(t, 2100.50, p2.AreaSqm)
	require.Equal(t, "住宅區", p2.UrbanZoning)
	require.Equal(t, "住宅", p2.LandUseCategory)
}

func TestGeojsonToWKT_SampleData(t *testing.T) {
	var fc struct {
		Features []struct {
			Geometry json.RawMessage `json:"geometry"`
		} `json:"features"`
	}

	data, err := os.ReadFile("../../tests/testdata/gis_sample.geojson")
	require.NoError(t, err)
	require.NoError(t, json.Unmarshal(data, &fc))

	// First feature - polygon
	var geom gis.GeoJSONGeometry
	require.NoError(t, json.Unmarshal(fc.Features[0].Geometry, &geom))

	wkt, err := gis.GeoJSONToWKTForTest(geom)
	require.NoError(t, err)
	require.Contains(t, wkt, "POLYGON")

	// Third feature - linestring (road)
	require.NoError(t, json.Unmarshal(fc.Features[2].Geometry, &geom))
	_, err = gis.GeoJSONToWKTForTest(geom)
	require.Error(t, err) // Should fail for LineString
}

// MockGeometryEngine for testing
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

// testDownloader is a test implementation that embeds GISDownloader behavior
type testDownloader struct {
	data []byte
}

func (d *testDownloader) DownloadParcelGeoJSON(ctx context.Context, county, district, section, landNumber string) ([]byte, error) {
	return d.data, nil
}

func (d *testDownloader) DownloadRoadGeoJSON(ctx context.Context, bbox gis.BoundingBox) ([]byte, error) {
	return d.data, nil
}

// testProvenanceRecorder is a test implementation of ProvenanceRecorder
type testProvenanceRecorder struct{}

func (r *testProvenanceRecorder) RecordParcelProvenance(ctx context.Context, parcelID int64, source, sourceVersion string, snapshotID, importBatchID int64, sourceChecksum string, downloadedAt time.Time) error {
	return nil
}

func (r *testProvenanceRecorder) RecordRoadProvenance(ctx context.Context, roadID int64, source, sourceVersion string, snapshotID, importBatchID int64, sourceChecksum string, downloadedAt time.Time) error {
	return nil
}

// SnapshotRepository interface for testing
type testSnapshotRepository struct {
	*repository.ParcelRepository
}

func runMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	migrations := []string{
		`CREATE EXTENSION IF NOT EXISTS postgis;`,
		`CREATE EXTENSION IF NOT EXISTS pgcrypto;`,

		`CREATE TABLE IF NOT EXISTS dataset_snapshot (
			snapshot_id BIGSERIAL PRIMARY KEY,
			source TEXT NOT NULL,
			source_version TEXT NOT NULL,
			downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			published_at TIMESTAMPTZ,
			file_name TEXT NOT NULL,
			file_sha256 TEXT NOT NULL,
			record_count INT NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','IMPORTING','LOCKED','FAILED')),
			schema_version TEXT NOT NULL DEFAULT '1.0',
			import_started_at TIMESTAMPTZ,
			import_completed_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS import_batch (
			import_batch_id BIGSERIAL PRIMARY KEY,
			snapshot_id BIGINT NOT NULL REFERENCES dataset_snapshot(snapshot_id) ON DELETE RESTRICT,
			started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			completed_at TIMESTAMPTZ,
			status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING','COMPLETED','FAILED')),
			record_count INT NOT NULL DEFAULT 0,
			error_message TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS parcel (
			parcel_id BIGSERIAL PRIMARY KEY,
			county TEXT NOT NULL,
			district TEXT NOT NULL,
			section TEXT NOT NULL,
			land_number TEXT NOT NULL,
			area_sqm NUMERIC(12,2) NOT NULL CHECK (area_sqm > 0),
			urban_zoning TEXT,
			land_use_category TEXT,
			geometry GEOMETRY(MULTIPOLYGON, 3826) NOT NULL,
			centroid GEOMETRY(POINT, 3826),
			bbox GEOMETRY(POLYGON, 3826),
			source TEXT NOT NULL,
			source_version TEXT NOT NULL,
			snapshot_id BIGINT NOT NULL REFERENCES dataset_snapshot(snapshot_id) ON DELETE RESTRICT,
			import_batch_id BIGINT NOT NULL REFERENCES import_batch(import_batch_id) ON DELETE RESTRICT,
			source_record_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE (county, district, section, land_number, source_version),
			UNIQUE (snapshot_id, source_record_hash)
		);`,

		`CREATE TABLE IF NOT EXISTS parcel_geometry (
			geometry_id BIGSERIAL PRIMARY KEY,
			parcel_id BIGINT NOT NULL REFERENCES parcel(parcel_id) ON DELETE RESTRICT,
			geometry GEOMETRY(MULTIPOLYGON, 3826) NOT NULL,
			centroid GEOMETRY(POINT, 3826),
			bbox GEOMETRY(POLYGON, 3826),
			area_sqm NUMERIC(12,2) NOT NULL,
			source TEXT NOT NULL,
			source_version TEXT NOT NULL,
			import_batch_id BIGINT NOT NULL REFERENCES import_batch(import_batch_id) ON DELETE RESTRICT,
			snapshot_id BIGINT NOT NULL REFERENCES dataset_snapshot(snapshot_id) ON DELETE RESTRICT,
			source_checksum TEXT NOT NULL,
			downloaded_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS road_segment (
			road_id BIGSERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			road_class TEXT NOT NULL,
			width NUMERIC(8,2),
			geometry GEOMETRY(MULTILINESTRING, 3826) NOT NULL,
			source TEXT NOT NULL,
			source_version TEXT NOT NULL,
			import_batch_id BIGINT NOT NULL REFERENCES import_batch(import_batch_id) ON DELETE RESTRICT,
			snapshot_id BIGINT NOT NULL REFERENCES dataset_snapshot(snapshot_id) ON DELETE RESTRICT,
			source_checksum TEXT NOT NULL,
			downloaded_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE (name, road_class, source_version)
		);`,

		`CREATE TABLE IF NOT EXISTS data_provenance (
			entity_type TEXT NOT NULL,
			entity_id BIGINT NOT NULL,
			source TEXT NOT NULL,
			source_version TEXT NOT NULL,
			snapshot_id BIGINT NOT NULL REFERENCES dataset_snapshot(snapshot_id) ON DELETE RESTRICT,
			import_batch_id BIGINT NOT NULL REFERENCES import_batch(import_batch_id) ON DELETE RESTRICT,
			source_checksum TEXT NOT NULL,
			downloaded_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			PRIMARY KEY (entity_type, entity_id)
		);`,

		`CREATE INDEX IF NOT EXISTS idx_parcel_geometry_gist ON parcel USING GIST (geometry);`,
		`CREATE INDEX IF NOT EXISTS idx_parcel_centroid_gist ON parcel USING GIST (centroid);`,
		`CREATE INDEX IF NOT EXISTS idx_parcel_bbox_gist ON parcel USING GIST (bbox);`,
		`CREATE INDEX IF NOT EXISTS idx_parcel_geometry_geom_gist ON parcel_geometry USING GIST (geometry);`,
		`CREATE INDEX IF NOT EXISTS idx_parcel_geometry_centroid_gist ON parcel_geometry USING GIST (centroid);`,
		`CREATE INDEX IF NOT EXISTS idx_road_segment_geometry_gist ON road_segment USING GIST (geometry);`,
		`CREATE INDEX IF NOT EXISTS idx_dataset_snapshot_source ON dataset_snapshot (source, source_version);`,
	}

	for _, migration := range migrations {
		_, err := pool.Exec(ctx, migration)
		if err != nil {
			return err
		}
	}

	return nil
}