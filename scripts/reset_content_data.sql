BEGIN;

-- Preserve users, profiles, roles, permissions, domains, settings and feature flags.
DELETE FROM ai_evaluation_jobs;
DELETE FROM raw_news_items;
DELETE FROM news_fetch_runs;
DELETE FROM reports;
DELETE FROM moderation_actions;
DELETE FROM post_reactions;
DELETE FROM comment_reactions;
DELETE FROM comments;
DELETE FROM post_bookmarks;
DELETE FROM post_media;
DELETE FROM post_topics;
DELETE FROM post_tags;
DELETE FROM posts;
DELETE FROM topics;
DELETE FROM tags;
DELETE FROM categories;
DELETE FROM news_sources;

COMMIT;
