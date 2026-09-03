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

-- name: GetRoadSegmentByName :one
SELECT road_id, name, road_class, width, geometry,
       source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at,
       created_at, updated_at
FROM road_segment
WHERE name = $1 AND road_class = $2 AND source_version = $3;

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

-- name: SearchRoadSegmentsByBBox :many
SELECT road_id, name, road_class, width, geometry,
       source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at,
       created_at, updated_at
FROM road_segment
WHERE geometry && ST_MakeEnvelope($1, $2, $3, $4, 3826)
  AND ($5 = '' OR road_class = $5)
  AND ($6 = 0 OR snapshot_id = $6)
ORDER BY road_id
LIMIT $7 OFFSET $8;

-- name: GetRoadSegmentsNearPoint :many
SELECT road_id, name, road_class, width, geometry,
       source, source_version, import_batch_id, snapshot_id, source_checksum, downloaded_at,
       ST_Distance(geometry, ST_SetSRID(ST_MakePoint($1, $2), 3826)) AS distance_m,
       created_at, updated_at
FROM road_segment
WHERE ST_DWithin(geometry, ST_SetSRID(ST_MakePoint($1, $2), 3826), $3)
  AND ($4 = '' OR road_class = $4)
  AND ($5 = 0 OR snapshot_id = $5)
ORDER BY distance_m
LIMIT $6;

-- name: EnsureRoadSegmentGISTIndex :exec
CREATE INDEX IF NOT EXISTS idx_road_segment_geometry_gist ON road_segment USING GIST (geometry);

-- name: VacuumAnalyzeRoadSegment :exec
VACUUM ANALYZE road_segment;

-- name: CreateRoadSegmentProvenance :exec
INSERT INTO data_provenance (
    entity_type, entity_id, source, source_version,
    snapshot_id, import_batch_id, source_checksum, downloaded_at
) VALUES (
    'road_segment', $1, $2, $3, $4, $5, $6, $7
);