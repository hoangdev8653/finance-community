-- Allow the dedicated Post Moderation approve/ban endpoints to record actions.
-- Safe to run multiple times.

ALTER TABLE moderation_actions
  DROP CONSTRAINT IF EXISTS chk_moderation_actions_action_type;

ALTER TABLE moderation_actions
  ADD CONSTRAINT chk_moderation_actions_action_type
  CHECK (action_type IN (
    'WARN',
    'HIDE_CONTENT',
    'SUSPEND',
    'BAN',
    'DISMISS',
    'APPROVE_POST',
    'BAN_POST'
  ));
