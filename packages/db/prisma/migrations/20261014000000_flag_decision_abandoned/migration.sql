ALTER TYPE "release_flag_decision_type" ADD VALUE 'abandoned';

ALTER TYPE "flag_history_event_type" ADD VALUE 'decision_abandoned' AFTER 'decision_in_progress';
