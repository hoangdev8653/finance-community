-- Dọn các category cũ chưa từng được dùng. Category cũ có bài viết được giữ lại để bảo toàn dữ liệu.
DELETE FROM categories c
WHERE c.scope <> 'SERIES'
  AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.category_id = c.id);
