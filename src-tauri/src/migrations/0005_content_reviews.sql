CREATE TABLE content_reviews (
  id TEXT PRIMARY KEY,
  package_id TEXT NOT NULL,
  package_version TEXT NOT NULL,
  reviewer_profile_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (reviewer_profile_id) REFERENCES profiles(id),
  FOREIGN KEY (package_id, package_version) REFERENCES content_packages(package_id, version)
);

CREATE INDEX idx_content_reviews_package
  ON content_reviews(package_id, package_version, created_at);
