package gis

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
)

// GeometryEngineInterface defines the interface for geometry operations
type GeometryEngineInterface interface {
	TransformWKTToInternal(wkt4326 string) (string, error)
	ComputeCentroidAndBBox(wkt3826 string) ([]byte, []byte, error)
	ValidateGeometry(wkt3826 string) error
}

// GeometryEngine provides PostGIS-based geometry operations
type GeometryEngine struct {
	db *pgx.Conn
}

// NewGeometryEngine creates a new GeometryEngine
func NewGeometryEngine(db *pgx.Conn) *GeometryEngine {
	return &GeometryEngine{db: db}
}

// TransformWKTToInternal transforms WKT from EPSG:4326 to EPSG:3826
func (g *GeometryEngine) TransformWKTToInternal(wkt4326 string) (string, error) {
	// Use PostGIS ST_Transform to convert from 4326 to 3826
	query := `
		SELECT ST_AsText(ST_Transform(ST_GeomFromText($1, 4326), 3826))
	`
	var wkt3826 string
	err := g.db.QueryRow(context.Background(), query, wkt4326).Scan(&wkt3826)
	if err != nil {
		return "", fmt.Errorf("failed to transform geometry: %w", err)
	}
	return wkt3826, nil
}

// TransformWKTToExternal transforms WKT from EPSG:3826 to EPSG:4326
func (g *GeometryEngine) TransformWKTToExternal(wkt3826 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_Transform(ST_GeomFromText($1, 3826), 4326))
	`
	var wkt4326 string
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&wkt4326)
	if err != nil {
		return "", fmt.Errorf("failed to transform geometry: %w", err)
	}
	return wkt4326, nil
}

// ComputeCentroidAndBBox computes centroid and bounding box for a geometry in 3826
func (g *GeometryEngine) ComputeCentroidAndBBox(wkt3826 string) ([]byte, []byte, error) {
	query := `
		SELECT 
			ST_AsBinary(ST_Centroid(ST_GeomFromText($1, 3826))),
			ST_AsBinary(ST_Envelope(ST_GeomFromText($1, 3826)))
	`
	var centroid, bbox []byte
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&centroid, &bbox)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to compute centroid/bbox: %w", err)
	}
	return centroid, bbox, nil
}

// ValidateGeometry validates a geometry in 3826
func (g *GeometryEngine) ValidateGeometry(wkt3826 string) error {
	query := `
		SELECT ST_IsValid(ST_GeomFromText($1, 3826)), ST_IsValidReason(ST_GeomFromText($1, 3826))
	`
	var isValid bool
	var reason string
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&isValid, &reason)
	if err != nil {
		return fmt.Errorf("failed to validate geometry: %w", err)
	}
	if !isValid {
		return fmt.Errorf("geometry invalid: %s", reason)
	}

	// Check for self-intersection
	query = `
		SELECT ST_IsSimple(ST_GeomFromText($1, 3826))
	`
	var isSimple bool
	err = g.db.QueryRow(context.Background(), query, wkt3826).Scan(&isSimple)
	if err != nil {
		return fmt.Errorf("failed to check simplicity: %w", err)
	}
	if !isSimple {
		return fmt.Errorf("geometry has self-intersections")
	}

	return nil
}

// STIntersects checks if two geometries intersect
func (g *GeometryEngine) STIntersects(geom1, geom2 string) (bool, error) {
	query := `
		SELECT ST_Intersects(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826))
	`
	var intersects bool
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&intersects)
	return intersects, err
}

// STWithin checks if geom1 is within geom2
func (g *GeometryEngine) STWithin(geom1, geom2 string) (bool, error) {
	query := `
		SELECT ST_Within(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826))
	`
	var within bool
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&within)
	return within, err
}

// STContains checks if geom1 contains geom2
func (g *GeometryEngine) STContains(geom1, geom2 string) (bool, error) {
	query := `
		SELECT ST_Contains(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826))
	`
	var contains bool
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&contains)
	return contains, err
}

// STDistance computes distance between two geometries
func (g *GeometryEngine) STDistance(geom1, geom2 string) (float64, error) {
	query := `
		SELECT ST_Distance(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826))
	`
	var dist float64
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&dist)
	return dist, err
}

// STDWithin checks if geometries are within distance
func (g *GeometryEngine) STDWithin(geom1, geom2 string, distance float64) (bool, error) {
	query := `
		SELECT ST_DWithin(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826), $3)
	`
	var within bool
	err := g.db.QueryRow(context.Background(), query, geom1, geom2, distance).Scan(&within)
	return within, err
}

// STArea computes area of a geometry
func (g *GeometryEngine) STArea(wkt3826 string) (float64, error) {
	query := `
		SELECT ST_Area(ST_GeomFromText($1, 3826))
	`
	var area float64
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&area)
	return area, err
}

// STCentroid computes centroid of a geometry
func (g *GeometryEngine) STCentroid(wkt3826 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_Centroid(ST_GeomFromText($1, 3826)))
	`
	var centroid string
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&centroid)
	return centroid, err
}

// EnsureMultiPolygon ensures geometry is a MultiPolygon
func (g *GeometryEngine) EnsureMultiPolygon(wkt3826 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_Multi(ST_GeomFromText($1, 3826)))
	`
	var multi string
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&multi)
	return multi, err
}

// MakeValid attempts to make an invalid geometry valid
func (g *GeometryEngine) MakeValid(wkt3826 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_MakeValid(ST_GeomFromText($1, 3826)))
	`
	var valid string
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&valid)
	return valid, err
}

// Buffer creates a buffer around a geometry
func (g *GeometryEngine) Buffer(wkt3826 string, distance float64) (string, error) {
	query := `
		SELECT ST_AsText(ST_Buffer(ST_GeomFromText($1, 3826), $2))
	`
	var buffered string
	err := g.db.QueryRow(context.Background(), query, wkt3826, distance).Scan(&buffered)
	return buffered, err
}

// Intersection computes intersection of two geometries
func (g *GeometryEngine) Intersection(geom1, geom2 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_Intersection(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826)))
	`
	var intersection string
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&intersection)
	return intersection, err
}

// Union computes union of two geometries
func (g *GeometryEngine) Union(geom1, geom2 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_Union(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826)))
	`
	var union string
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&union)
	return union, err
}

// Difference computes difference of two geometries
func (g *GeometryEngine) Difference(geom1, geom2 string) (string, error) {
	query := `
		SELECT ST_AsText(ST_Difference(ST_GeomFromText($1, 3826), ST_GeomFromText($2, 3826)))
	`
	var diff string
	err := g.db.QueryRow(context.Background(), query, geom1, geom2).Scan(&diff)
	return diff, err
}

// SRID returns the SRID of a geometry
func (g *GeometryEngine) SRID(wkt3826 string) (int, error) {
	query := `
		SELECT ST_SRID(ST_GeomFromText($1, 3826))
	`
	var srid int
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&srid)
	return srid, err
}

// GeometryType returns the geometry type
func (g *GeometryEngine) GeometryType(wkt3826 string) (string, error) {
	query := `
		SELECT ST_GeometryType(ST_GeomFromText($1, 3826))
	`
	var geomType string
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&geomType)
	// ST_GeometryType returns "ST_MultiPolygon", "ST_Polygon", etc.
	return strings.TrimPrefix(geomType, "ST_"), err
}

// NumGeometries returns number of geometries in a collection
func (g *GeometryEngine) NumGeometries(wkt3826 string) (int, error) {
	query := `
		SELECT ST_NumGeometries(ST_GeomFromText($1, 3826))
	`
	var n int
	err := g.db.QueryRow(context.Background(), query, wkt3826).Scan(&n)
	return n, err
}