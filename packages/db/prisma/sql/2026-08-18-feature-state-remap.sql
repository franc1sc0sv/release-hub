BEGIN;

ALTER TYPE feature_state RENAME TO feature_state_old;

CREATE TYPE feature_state AS ENUM (
  'in_progress',
  'shipped_flag_off',
  'ready_to_release',
  'partial',
  'fully_released',
  'blocked',
  'completed'
);

ALTER TABLE features ALTER COLUMN state DROP DEFAULT;
ALTER TABLE feature_in_releases ALTER COLUMN state DROP DEFAULT;

ALTER TABLE features
  ALTER COLUMN state TYPE feature_state
  USING (
    CASE state::text
      WHEN 'live_staging' THEN 'partial'
      WHEN 'live_prod' THEN 'partial'
      WHEN 'flag_cleanup_pending' THEN 'partial'
      ELSE state::text
    END
  )::feature_state;

ALTER TABLE feature_in_releases
  ALTER COLUMN state TYPE feature_state
  USING (
    CASE state::text
      WHEN 'live_staging' THEN 'partial'
      WHEN 'live_prod' THEN 'partial'
      WHEN 'flag_cleanup_pending' THEN 'partial'
      ELSE state::text
    END
  )::feature_state;

ALTER TABLE feature_state_events
  ALTER COLUMN from_state TYPE feature_state
  USING (
    CASE from_state::text
      WHEN 'live_staging' THEN 'partial'
      WHEN 'live_prod' THEN 'partial'
      WHEN 'flag_cleanup_pending' THEN 'partial'
      ELSE from_state::text
    END
  )::feature_state;

ALTER TABLE feature_state_events
  ALTER COLUMN to_state TYPE feature_state
  USING (
    CASE to_state::text
      WHEN 'live_staging' THEN 'partial'
      WHEN 'live_prod' THEN 'partial'
      WHEN 'flag_cleanup_pending' THEN 'partial'
      ELSE to_state::text
    END
  )::feature_state;

ALTER TABLE features ALTER COLUMN state SET DEFAULT 'in_progress'::feature_state;
ALTER TABLE feature_in_releases ALTER COLUMN state SET DEFAULT 'in_progress'::feature_state;

DROP TYPE feature_state_old;

COMMIT;
