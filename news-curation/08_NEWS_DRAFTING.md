# NEWS DRAFTING

## Mục tiêu
Biến kết quả AI thành bài DRAFT trong hệ thống.

## Quy tắc
Mọi bài AI tạo ra:
status = DRAFT

Không publish trực tiếp.

## Dữ liệu
title, slug, excerpt, content, category_id, tags, media, source references, author/system author, status, AI metadata, fact-check status.

## Quality Gate
- title tồn tại;
- content tồn tại;
- source tồn tại;
- category hợp lệ;
- tags hợp lệ;
- fact-check không FAILED;
- không duplicate;
- AI generation hoàn tất.

## Admin Queue
/admin/news-curation

BTV có thể xem, sửa, reject, ignore, publish.

## Quick URL Import
URL → Validate → Extract → Analyze → Write → Fact Check → DRAFT.

Không được bypass quality gates.

## Provenance
DRAFT phải truy được source, URL, AI generation, thời điểm tạo và prompt version.
