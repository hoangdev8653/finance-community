CREATE TABLE IF NOT EXISTS post_topics (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_topics PRIMARY KEY (post_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_post_topics_topic_id ON post_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_post_id ON post_topics(post_id);

UPDATE domains
SET name = 'Career',
    name_vi = 'Nghề nghiệp',
    name_en = 'Career',
    updated_at = now()
WHERE code = 'CAREER'
  AND (name = 'Career & Learning' OR name_en = 'Career & Learning');
