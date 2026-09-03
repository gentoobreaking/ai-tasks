package domain

import (
	"time"
)

// Parcel represents a land parcel
type Parcel struct {
	ParcelID          int64
	County            string
	District          string
	Section           string
	LandNumber        string
	AreaSqm           float64
	UrbanZoning       string
	LandUseCategory   string
	Geometry          []byte // WKB MultiPolygon, SRID 3826
	Centroid          []byte // WKB Point, SRID 3826
	BBox              []byte // WKB Polygon, SRID 3826
	Source            string
	SourceVersion     string
	SnapshotID        int64
	ImportBatchID     int64
	SourceRecordHash  string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// ParcelGeometry represents the geometry of a parcel
type ParcelGeometry struct {
	ParcelID        int64
	Geometry        []byte // WKB MultiPolygon, SRID 3826
	Centroid        []byte // WKB Point, SRID 3826
	BBox            []byte // WKB Polygon, SRID 3826
	AreaSqm         float64
	Source          string
	SourceVersion   string
	ImportBatchID   int64
	SnapshotID      int64
	SourceChecksum  string
	DownloadedAt    time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// RoadSegment represents a road segment
type RoadSegment struct {
	RoadID          int64
	Name            string
	RoadClass       string
	Width           float64
	Geometry        []byte // WKB MultiLineString, SRID 3826
	Source          string
	SourceVersion   string
	ImportBatchID   int64
	SnapshotID      int64
	SourceChecksum  string
	DownloadedAt    time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// ParcelRoadAccess represents road access for a parcel
type ParcelRoadAccess struct {
	ParcelID         int64
	RoadID           int64
	DistanceM        float64
	NearestPoint     []byte // WKB Point, SRID 3826
	RoadWidthM       float64
	AccessType       string // ROAD_ADJACENT, ROAD_NEARBY, NO_ROAD_DETECTED, UNKNOWN
	Source           string
	AlgorithmVersion string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// ImportBatch represents an import batch
type ImportBatch struct {
	ID              int64
	SnapshotID      int64
	StartedAt       time.Time
	CompletedAt     *time.Time
	Status          string // PENDING, RUNNING, COMPLETED, FAILED
	RecordCount     int
	ErrorMessage    string
	CreatedAt       time.Time
}

// ProvenanceRecord represents a provenance record
type ProvenanceRecord struct {
	EntityType     string // parcel, road_segment, transaction, valuation
	EntityID       int64
	Source         string
	SourceVersion  string
	SnapshotID     int64
	ImportBatchID  int64
	SourceChecksum string
	DownloadedAt   time.Time
	CreatedAt      time.Time
}