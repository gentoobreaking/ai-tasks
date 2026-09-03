-- name: CreateParcel :one
INSERT INTO parcel (
    county, district, section, land_number,
    area_sqm, urban_zoning, land_use_category,
    geometry, centroid, bbox,
    source, source_version, snapshot_id, import_batch_id, source_record_hash
) VALUES (
    $1, $2, $3, $4,
    $5, $6, $7,
    ST_Multi(ST_SetSRID(ST_GeomFromWKB($8), 3826)),
    ST_SetSRID(ST_GeomFromWKB($9), 3826),
    ST_SetSRID(ST_GeomFromWKB($10), 3826),
    $11, $12, $13, $14, $15
)
ON CONFLICT (county, district, section, land_number, source_version)
DO UPDATE SET
    geometry = EXCLUDED.geometry,
    centroid = EXCLUDED.centroid,
    bbox = EXCLUDED.bbox,
    area_sqm = EXCLUDED.area_sqm,
    urban_zoning = EXCLUDED.urban_zoning,
    land_use_category = EXCLUDED.land_use_category,
    source = EXCLUDED.source,
    snapshot_id = EXCLUDED.snapshot_id,
    import_batch_id = EXCLUDED.import_batch_id,
    source_record_hash = EXCLUDED.source_record_hash,
    updated_at = NOW()
RETURNING parcel_id;

-- name: BatchInsertParcels :copyfrom
INSERT INTO parcel (
    county, district, section, land_number,
    area_sqm, urban_zoning, land_use_category,
    geometry, centroid, bbox,
    source, source_version, snapshot_id, import_batch_id, source_record_hash
) VALUES (
    $1, $2, $3, $4,
    $5, $6, $7,
    ST_Multi(ST_SetSRID(ST_GeomFromWKB($8), 3826)),
    ST_SetSRID(ST_GeomFromWKB($9), 3826),
    ST_SetSRID(ST_GeomFromWKB($10), 3826),
    $11, $12, $13, $14, $15
)
ON CONFLICT (county, district, section, land_number, source_version)
DO UPDATE SET
    geometry = EXCLUDED.geometry,
    centroid = EXCLUDED.centroid,
    bbox = EXCLUDED.bbox,
    area_sqm = EXCLUDED.area_sqm,
    urban_zoning = EXCLUDED.urban_zoning,
    land_use_category = EXCLUDED.land_use_category,
    source = EXCLUDED.source,
    snapshot_id = EXCLUDED.snapshot_id,
    import_batch_id = EXCLUDED.import_batch_id,
    source_record_hash = EXCLUDED.source_record_hash,
    updated_at = NOW();

-- name: GetParcelByID :one
SELECT parcel_id, county, district, section, land_number,
       area_sqm, urban_zoning, land_use_category,
       geometry, centroid, bbox,
       source, source_version, snapshot_id, import_batch_id, source_record_hash,
       created_at, updated_at
FROM parcel
WHERE parcel_id = $1;

-- name: GetParcelByLandNumber :one
SELECT parcel_id, county, district, section, land_number,
       area_sqm, urban_zoning, land_use_category,
       geometry, centroid, bbox,
       source, source_version, snapshot_id, import_batch_id, source_record_hash,
       created_at, updated_at
FROM parcel
WHERE county = $1 AND district = $2 AND section = $3 AND land_number = $4 AND source_version = $5;

-- name: SearchParcels :many
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
LIMIT $6 OFFSET $7;

-- name: GetParcelCount :one
SELECT COUNT(*)
FROM parcel
WHERE ($1 = '' OR county = $1)
  AND ($2 = '' OR district = $2)
  AND ($3 = '' OR section = $3);

-- name: CreateParcelGeometry :one
INSERT INTO parcel_geometry (
    parcel_id, geometry, centroid, bbox, area_sqm,
    source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at
) VALUES (
    $1,
    ST_Multi(ST_SetSRID(ST_GeomFromWKB($2), 3826)),
    ST_SetSRID(ST_GeomFromWKB($3), 3826),
    ST_SetSRID(ST_GeomFromWKB($4), 3826),
    $5, $6, $7, $8, $9, $10, $11
)
RETURNING geometry_id;

-- name: BatchInsertParcelGeometries :copyfrom
INSERT INTO parcel_geometry (
    parcel_id, geometry, centroid, bbox, area_sqm,
    source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at
) VALUES (
    $1,
    ST_Multi(ST_SetSRID(ST_GeomFromWKB($2), 3826)),
    ST_SetSRID(ST_GeomFromWKB($3), 3826),
    ST_SetSRID(ST_GeomFromWKB($4), 3826),
    $5, $6, $7, $8, $9, $10, $11
);

-- name: GetParcelGeometry :one
SELECT geometry_id, parcel_id, geometry, centroid, bbox, area_sqm,
       source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at,
       created_at, updated_at
FROM parcel_geometry
WHERE parcel_id = $1;

-- name: CreateRoadSegment :one
INSERT INTO road_segment (
    name, road_class, width, geometry,
    source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at
) VALUES (
    $1, $2, $3,
    ST_Multi(ST_SetSRID(ST_GeomFromWKB($4), 3826)),
    $5, $6, $7, $8, $9, $10
)
ON CONFLICT (name, road_class, source_version)
DO UPDATE SET
    geometry = EXCLUDED.geometry,
    width = EXCLUDED.width,
    source = EXCLUDED.source,
    snapshot_id = EXCLUDED.snapshot_id,
    import_batch_id = EXCLUDED.import_batch_id,
    source_checksum = EXCLUDED.source_checksum,
    downloaded_at = EXCLUDED.downloaded_at,
    updated_at = NOW()
RETURNING road_id;

-- name: BatchInsertRoadSegments :copyfrom
INSERT INTO road_segment (
    name, road_class, width, geometry,
    source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at
) VALUES (
    $1, $2, $3,
    ST_Multi(ST_SetSRID(ST_GeomFromWKB($4), 3826)),
    $5, $6, $7, $8, $9, $10
)
ON CONFLICT (name, road_class, source_version)
DO UPDATE SET
    geometry = EXCLUDED.geometry,
    width = EXCLUDED.width,
    source = EXCLUDED.source,
    snapshot_id = EXCLUDED.snapshot_id,
    import_batch_id = EXCLUDED.import_batch_id,
    source_checksum = EXCLUDED.source_checksum,
    downloaded_at = EXCLUDED.downloaded_at,
    updated_at = NOW();

-- name: GetRoadSegment :one
SELECT road_id, name, road_class, width, geometry,
       source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at,
       created_at, updated_at
FROM road_segment
WHERE road_id = $1;

-- name: SearchRoadSegments :many
SELECT road_id, name, road_class, width, geometry,
       source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at,
       created_at, updated_at
FROM road_segment
WHERE ($1 = '' OR name ILIKE '%' || $1 || '%')
  AND ($2 = '' OR road_class = $2)
  AND ($3 = 0 OR snapshot_id = $3)
ORDER BY road_id
LIMIT $4 OFFSET $5;

-- name: CreateImportBatch :one
INSERT INTO import_batch (snapshot_id, status)
VALUES ($1, 'RUNNING')
RETURNING import_batch_id;

-- name: UpdateImportBatch :exec
UPDATE import_batch
SET status = $2, completed_at = CASE WHEN $2 IN ('COMPLETED', 'FAILED') THEN NOW() ELSE NULL END,
    record_count = $3, error_message = $4
WHERE import_batch_id = $1;

-- name: GetImportBatch :one
SELECT import_batch_id, snapshot_id, started_at, completed_at, status, record_count, error_message
FROM import_batch
WHERE import_batch_id = $1;

-- name: CreateDatasetSnapshot :one
INSERT INTO dataset_snapshot (
    source, source_version, downloaded_at, file_name, file_sha256,
    record_count, status, schema_version
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING snapshot_id;

-- name: UpdateDatasetSnapshotStatus :exec
UPDATE dataset_snapshot
SET status = $2,
    import_started_at = CASE WHEN $2 = 'IMPORTING' THEN NOW() ELSE import_started_at END,
    import_completed_at = CASE WHEN $2 = 'LOCKED' THEN NOW() ELSE import_completed_at END,
    published_at = CASE WHEN $2 = 'LOCKED' THEN NOW() ELSE published_at END
WHERE snapshot_id = $1;

-- name: LockDatasetSnapshot :exec
UPDATE dataset_snapshot
SET status = 'LOCKED',
    import_completed_at = NOW(),
    published_at = NOW()
WHERE snapshot_id = $1 AND status = 'IMPORTING';

-- name: GetDatasetSnapshot :one
SELECT snapshot_id, source, source_version, downloaded_at, published_at,
       file_name, file_sha256, record_count, status, schema_version,
       import_started_at, import_completed_at
FROM dataset_snapshot
WHERE snapshot_id = $1;

-- name: EnsureParcelGISTIndex :exec
CREATE INDEX IF NOT EXISTS idx_parcel_geometry_gist ON parcel USING GIST (geometry);

-- name: EnsureParcelGeometryGISTIndex :exec
CREATE INDEX IF NOT EXISTS idx_parcel_geometry_geom_gist ON parcel_geometry USING GIST (geometry);

-- name: EnsureParcelCentroidGISTIndex :exec
CREATE INDEX IF NOT EXISTS idx_parcel_centroid_gist ON parcel USING GIST (centroid);

-- name: EnsureRoadSegmentGISTIndex :exec
CREATE INDEX IF NOT EXISTS idx_road_segment_geometry_gist ON road_segment USING GIST (geometry);

-- name: VacuumAnalyzeParcel :exec
VACUUM ANALYZE parcel;

-- name: VacuumAnalyzeParcelGeometry :exec
VACUUM ANALYZE parcel_geometry;

-- name: VacuumAnalyzeRoadSegment :exec
VACUUM ANALYZE road_segment;

-- name: CreateParcelProvenance :exec
INSERT INTO data_provenance (
    entity_type, entity_id, source, source_version,
    snapshot_id, import_batch_id, source_checksum, downloaded_at
) VALUES (
    'parcel', $1, $2, $3, $4, $5, $6, $7
);

-- name: CreateRoadSegmentProvenance :exec
INSERT INTO data_provenance (
    entity_type, entity_id, source, source_version,
    snapshot_id, import_batch_id, source_checksum, downloaded_at
) VALUES (
    'road_segment', $1, $2, $3, $4, $5, $6, $7
);

-- name: GetProvenanceByEntity :many
SELECT entity_type, entity_id, source, source_version,
       snapshot_id, import_batch_id, source_checksum, downloaded_at
FROM data_provenance
WHERE entity_type = $1 AND entity_id = $2;