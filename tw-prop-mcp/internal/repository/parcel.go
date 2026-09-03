package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"tw-prop-mcp/internal/domain"
	"tw-prop-mcp/internal/gis"
)

// ParcelRepository handles parcel database operations
type ParcelRepository struct {
	db *pgxpool.Pool
}

// NewParcelRepository creates a new ParcelRepository
func NewParcelRepository(db *pgxpool.Pool) *ParcelRepository {
	return &ParcelRepository{db: db}
}

// BatchInsertParcels inserts multiple parcels using COPY
func (r *ParcelRepository) BatchInsertParcels(ctx context.Context, parcels []gis.ParsedParcel, batchID, snapshotID int64) (int, error) {
	if len(parcels) == 0 {
		return 0, nil
	}

	// Use pgx CopyFrom for efficient batch insert
	rows := make([][]interface{}, len(parcels))
	for i, p := range parcels {
		rows[i] = []interface{}{
			p.County,
			p.District,
			p.Section,
			p.LandNumber,
			p.AreaSqm,
			p.UrbanZoning,
			p.LandUseCategory,
			p.Geometry3826,
			p.Centroid3826,
			p.BBox3826,
			gis.NLSCGISSource,
			"1.0", // source_version - should come from config
			snapshotID,
			batchID,
			p.SourceRecordHash,
		}
	}

	// Prepare copy from source
	copySource := pgx.CopyFromSlice(len(parcels), func(i int) ([]interface{}, error) {
		if i >= len(rows) {
			return nil, pgx.ErrNoRows
		}
		return rows[i], nil
	})

	_, err := r.db.CopyFrom(
		ctx,
		pgx.Identifier{"parcel"},
		[]string{
			"county", "district", "section", "land_number",
			"area_sqm", "urban_zoning", "land_use_category",
			"geometry", "centroid", "bbox",
			"source", "source_version", "snapshot_id", "import_batch_id", "source_record_hash",
		},
		copySource,
	)
	if err != nil {
		return 0, fmt.Errorf("batch insert parcels failed: %w", err)
	}

	return len(parcels), nil
}

// BatchInsertRoadSegments inserts multiple road segments using COPY
func (r *ParcelRepository) BatchInsertRoadSegments(ctx context.Context, segments []gis.ParsedRoadSegment, batchID, snapshotID int64) (int, error) {
	if len(segments) == 0 {
		return 0, nil
	}

	rows := make([][]interface{}, len(segments))
	for i, s := range segments {
		rows[i] = []interface{}{
			s.Name,
			s.RoadClass,
			s.Width,
			s.Geometry3826,
			gis.NLSCGISSource,
			"1.0", // source_version
			batchID,
			snapshotID,
			s.SourceRecordHash,
			time.Now(), // downloaded_at
		}
	}

	copySource := pgx.CopyFromSlice(len(segments), func(i int) ([]interface{}, error) {
		if i >= len(rows) {
			return nil, pgx.ErrNoRows
		}
		return rows[i], nil
	})

	_, err := r.db.CopyFrom(
		ctx,
		pgx.Identifier{"road_segment"},
		[]string{
			"name", "road_class", "width", "geometry",
			"source", "source_version", "import_batch_id", "snapshot_id", "source_checksum", "downloaded_at",
		},
		copySource,
	)
	if err != nil {
		return 0, fmt.Errorf("batch insert road segments failed: %w", err)
	}

	return len(segments), nil
}

// CreateImportBatch creates a new import batch record
func (r *ParcelRepository) CreateImportBatch(ctx context.Context, snapshotID int64) (int64, error) {
	var batchID int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO import_batch (snapshot_id, status)
		VALUES ($1, 'RUNNING')
		RETURNING import_batch_id
	`, snapshotID).Scan(&batchID)
	if err != nil {
		return 0, fmt.Errorf("create import batch failed: %w", err)
	}
	return batchID, nil
}

// UpdateImportBatch updates an import batch record
func (r *ParcelRepository) UpdateImportBatch(ctx context.Context, batchID int64, status string, recordCount int, errMsg string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE import_batch
		SET status = $2, 
		    completed_at = CASE WHEN $2 IN ('COMPLETED', 'FAILED') THEN NOW() ELSE NULL END,
		    record_count = $3, 
		    error_message = $4
		WHERE import_batch_id = $1
	`, batchID, status, recordCount, errMsg)
	return err
}

// EnsureGISTIndexes ensures GIST indexes exist on geometry columns
func (r *ParcelRepository) EnsureGISTIndexes(ctx context.Context) error {
	// Parcel geometry index
	_, err := r.db.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_parcel_geometry_gist ON parcel USING GIST (geometry)`)
	if err != nil {
		return fmt.Errorf("create parcel geometry index: %w", err)
	}

	// Parcel centroid index
	_, err = r.db.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_parcel_centroid_gist ON parcel USING GIST (centroid)`)
	if err != nil {
		return fmt.Errorf("create parcel centroid index: %w", err)
	}

	// Parcel bbox index
	_, err = r.db.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_parcel_bbox_gist ON parcel USING GIST (bbox)`)
	if err != nil {
		return fmt.Errorf("create parcel bbox index: %w", err)
	}

	// Parcel geometry table indexes
	_, err = r.db.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_parcel_geometry_geom_gist ON parcel_geometry USING GIST (geometry)`)
	if err != nil {
		return fmt.Errorf("create parcel_geometry geometry index: %w", err)
	}

	_, err = r.db.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_parcel_geometry_centroid_gist ON parcel_geometry USING GIST (centroid)`)
	if err != nil {
		return fmt.Errorf("create parcel_geometry centroid index: %w", err)
	}

	// Road segment index
	_, err = r.db.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_road_segment_geometry_gist ON road_segment USING GIST (geometry)`)
	if err != nil {
		return fmt.Errorf("create road_segment geometry index: %w", err)
	}

	return nil
}

// RunVacuumAnalyze runs VACUUM ANALYZE on GIS tables
func (r *ParcelRepository) RunVacuumAnalyze(ctx context.Context) error {
	tables := []string{"parcel", "parcel_geometry", "road_segment"}
	for _, table := range tables {
		_, err := r.db.Exec(ctx, fmt.Sprintf("VACUUM ANALYZE %s", table))
		if err != nil {
			return fmt.Errorf("vacuum analyze %s: %w", table, err)
		}
	}
	return nil
}

// CreateParcelProvenance creates a provenance record for a parcel
func (r *ParcelRepository) CreateParcelProvenance(ctx context.Context, parcelID int64, source, sourceVersion string, snapshotID, importBatchID int64, sourceChecksum string, downloadedAt time.Time) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO data_provenance (
			entity_type, entity_id, source, source_version,
			snapshot_id, import_batch_id, source_checksum, downloaded_at
		) VALUES ('parcel', $1, $2, $3, $4, $5, $6, $7)
	`, parcelID, source, sourceVersion, snapshotID, importBatchID, sourceChecksum, downloadedAt)
	return err
}

// CreateRoadSegmentProvenance creates a provenance record for a road segment
func (r *ParcelRepository) CreateRoadSegmentProvenance(ctx context.Context, roadID int64, source, sourceVersion string, snapshotID, importBatchID int64, sourceChecksum string, downloadedAt time.Time) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO data_provenance (
			entity_type, entity_id, source, source_version,
			snapshot_id, import_batch_id, source_checksum, downloaded_at
		) VALUES ('road_segment', $1, $2, $3, $4, $5, $6, $7)
	`, roadID, source, sourceVersion, snapshotID, importBatchID, sourceChecksum, downloadedAt)
	return err
}

// GetParcelByID retrieves a parcel by ID
func (r *ParcelRepository) GetParcelByID(ctx context.Context, id int64) (*domain.Parcel, error) {
	var p domain.Parcel
	err := r.db.QueryRow(ctx, `
		SELECT parcel_id, county, district, section, land_number,
		       area_sqm, urban_zoning, land_use_category,
		       geometry, centroid, bbox,
		       source, source_version, snapshot_id, import_batch_id, source_record_hash,
		       created_at, updated_at
		FROM parcel
		WHERE parcel_id = $1
	`, id).Scan(
		&p.ParcelID, &p.County, &p.District, &p.Section, &p.LandNumber,
		&p.AreaSqm, &p.UrbanZoning, &p.LandUseCategory,
		&p.Geometry, &p.Centroid, &p.BBox,
		&p.Source, &p.SourceVersion, &p.SnapshotID, &p.ImportBatchID, &p.SourceRecordHash,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// GetParcelByLandNumber retrieves a parcel by land number
func (r *ParcelRepository) GetParcelByLandNumber(ctx context.Context, county, district, section, landNumber, sourceVersion string) (*domain.Parcel, error) {
	var p domain.Parcel
	err := r.db.QueryRow(ctx, `
		SELECT parcel_id, county, district, section, land_number,
		       area_sqm, urban_zoning, land_use_category,
		       geometry, centroid, bbox,
		       source, source_version, snapshot_id, import_batch_id, source_record_hash,
		       created_at, updated_at
		FROM parcel
		WHERE county = $1 AND district = $2 AND section = $3 AND land_number = $4 AND source_version = $5
	`, county, district, section, landNumber, sourceVersion).Scan(
		&p.ParcelID, &p.County, &p.District, &p.Section, &p.LandNumber,
		&p.AreaSqm, &p.UrbanZoning, &p.LandUseCategory,
		&p.Geometry, &p.Centroid, &p.BBox,
		&p.Source, &p.SourceVersion, &p.SnapshotID, &p.ImportBatchID, &p.SourceRecordHash,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// SearchParcels searches parcels with filters
func (r *ParcelRepository) SearchParcels(ctx context.Context, county, district, section, landNumber string, snapshotID int64, limit, offset int) ([]*domain.Parcel, error) {
	query := `
		SELECT parcel_id, county, district, section, land_number,
		       area_sqm, urban_zoning, land_use_category,
		       geometry, centroid, bbox,
		       source, source_version, snapshot_id, import_batch_id, source_record_hash,
		       created_at, updated_at
		FROM parcel
		WHERE ($1 = '' OR county = $1)
		  AND ($2 = '' OR district = $2)
		  AND ($3 = '' OR section = $3)
		  AND ($4 = '' OR land_number = $4)
		  AND ($5 = 0 OR snapshot_id = $5)
		ORDER BY parcel_id
		LIMIT $6 OFFSET $7
	`
	rows, err := r.db.Query(ctx, query, county, district, section, landNumber, snapshotID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var parcels []*domain.Parcel
	for rows.Next() {
		var p domain.Parcel
		if err := rows.Scan(
			&p.ParcelID, &p.County, &p.District, &p.Section, &p.LandNumber,
			&p.AreaSqm, &p.UrbanZoning, &p.LandUseCategory,
			&p.Geometry, &p.Centroid, &p.BBox,
			&p.Source, &p.SourceVersion, &p.SnapshotID, &p.ImportBatchID, &p.SourceRecordHash,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		parcels = append(parcels, &p)
	}
	return parcels, rows.Err()
}

// CreateDatasetSnapshot creates a new dataset snapshot
func (r *ParcelRepository) CreateDatasetSnapshot(ctx context.Context, source, sourceVersion, fileName, fileSHA256 string, recordCount int) (int64, error) {
	var snapshotID int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO dataset_snapshot (
			source, source_version, downloaded_at, file_name, file_sha256,
			record_count, status, schema_version
		) VALUES ($1, $2, NOW(), $3, $4, $5, 'PENDING', '1.0')
		RETURNING snapshot_id
	`, source, sourceVersion, fileName, fileSHA256, recordCount).Scan(&snapshotID)
	if err != nil {
		return 0, err
	}
	return snapshotID, nil
}

// UpdateDatasetSnapshotStatus updates snapshot status
func (r *ParcelRepository) UpdateDatasetSnapshotStatus(ctx context.Context, snapshotID int64, status string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE dataset_snapshot
		SET status = $2,
		    import_started_at = CASE WHEN $2 = 'IMPORTING' THEN NOW() ELSE import_started_at END,
		    import_completed_at = CASE WHEN $2 = 'LOCKED' THEN NOW() ELSE import_completed_at END,
		    published_at = CASE WHEN $2 = 'LOCKED' THEN NOW() ELSE published_at END
		WHERE snapshot_id = $1
	`, snapshotID, status)
	return err
}

// LockDatasetSnapshot locks a snapshot
func (r *ParcelRepository) LockDatasetSnapshot(ctx context.Context, snapshotID int64) error {
	_, err := r.db.Exec(ctx, `
		UPDATE dataset_snapshot
		SET status = 'LOCKED',
		    import_completed_at = NOW(),
		    published_at = NOW()
		WHERE snapshot_id = $1 AND status = 'IMPORTING'
	`, snapshotID)
	return err
}

// GetDatasetSnapshot retrieves a snapshot by ID
func (r *ParcelRepository) GetDatasetSnapshot(ctx context.Context, snapshotID int64) (*domain.DatasetSnapshot, error) {
	var s domain.DatasetSnapshot
	err := r.db.QueryRow(ctx, `
		SELECT snapshot_id, source, source_version, downloaded_at, published_at,
		       file_name, file_sha256, record_count, status, schema_version,
		       import_started_at, import_completed_at
		FROM dataset_snapshot
		WHERE snapshot_id = $1
	`, snapshotID).Scan(
		&s.ID, &s.Source, &s.SourceVersion, &s.DownloadedAt, &s.PublishedAt,
		&s.FileName, &s.FileSHA256, &s.RecordCount, &s.Status, &s.SchemaVersion,
		&s.ImportStartedAt, &s.ImportCompletedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}