# NEWS PUBLISHING

## Nguyên tắc
MVP:
AI → DRAFT → BTV REVIEW → PUBLISHED

## Workflow
DRAFT → REVIEW → EDIT → APPROVE → PUBLISHED
hoặc DRAFT → REJECTED.

## Publish Checklist
- [ ] Title chính xác.
- [ ] Sapo chính xác.
- [ ] Nội dung chính xác.
- [ ] Số liệu đúng.
- [ ] Nguồn đúng.
- [ ] Category đúng.
- [ ] Tags đúng.
- [ ] Thumbnail hợp lệ.
- [ ] Không duplicate.
- [ ] Không có claim đáng ngờ.

## Auto Publish
Không bật trong MVP.

Nếu tương lai có:
- whitelist source/category;
- confidence threshold;
- quality threshold;
- audit log;
- kill switch;
- rollback.

## Audit
Lưu editor_id, approved_at, published_at, article_version, AI generation id, source references.

## Sau publish
Nếu sai: tạo revision, sửa, lưu lịch sử; lỗi nghiêm trọng có thể unpublish/archive theo quyền.
