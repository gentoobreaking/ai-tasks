package domain

import (
	"time"
)

// SnapshotStatus represents the status of a dataset snapshot
type SnapshotStatus string

const (
	SnapshotStatusPending   SnapshotStatus = "PENDING"
	SnapshotStatusImporting SnapshotStatus = "IMPORTING"
	SnapshotStatusLocked    SnapshotStatus = "LOCKED"
	SnapshotStatusFailed    SnapshotStatus = "FAILED"
)

// DatasetSnapshot represents an immutable dataset snapshot
type DatasetSnapshot struct {
	ID                 int64
	Source             string
	SourceVersion      string
	DownloadedAt       time.Time
	PublishedAt        *time.Time
	FileName           string
	FileSHA256         string
	RecordCount        int
	Status             SnapshotStatus
	SchemaVersion      string
	ImportStartedAt    *time.Time
	ImportCompletedAt  *time.Time
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

// IsLocked returns true if the snapshot is locked (immutable)
func (s *DatasetSnapshot) IsLocked() bool {
	return s.Status == SnapshotStatusLocked
}

// CanTransitionTo returns true if the snapshot can transition to the given status
func (s *DatasetSnapshot) CanTransitionTo(newStatus SnapshotStatus) bool {
	transitions := map[SnapshotStatus][]SnapshotStatus{
		SnapshotStatusPending:   {SnapshotStatusImporting, SnapshotStatusFailed},
		SnapshotStatusImporting: {SnapshotStatusLocked, SnapshotStatusFailed},
		SnapshotStatusLocked:    {},
		SnapshotStatusFailed:    {SnapshotStatusPending},
	}
	allowed, ok := transitions[s.Status]
	if !ok {
		return false
	}
	for _, status := range allowed {
		if status == newStatus {
			return true
		}
	}
	return false
}

// TransitionTo transitions the snapshot to a new status
func (s *DatasetSnapshot) TransitionTo(newStatus SnapshotStatus) error {
	if !s.CanTransitionTo(newStatus) {
		return ErrInvalidSnapshotTransition
	}
	s.Status = newStatus
	now := time.Now()
	switch newStatus {
	case SnapshotStatusImporting:
		s.ImportStartedAt = &now
	case SnapshotStatusLocked:
		s.ImportCompletedAt = &now
	}
	s.UpdatedAt = now
	return nil
}

// ErrInvalidSnapshotTransition is returned when a snapshot transition is invalid
var ErrInvalidSnapshotTransition = &SnapshotError{Message: "invalid snapshot status transition"}

// SnapshotError represents a snapshot-related error
type SnapshotError struct {
	Message string
}

func (e *SnapshotError) Error() string {
	return e.Message
}