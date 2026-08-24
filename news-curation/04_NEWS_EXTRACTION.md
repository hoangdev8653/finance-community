# NEWS EXTRACTION

## Mục tiêu
Trích xuất dữ liệu cần thiết từ nguồn để phục vụ AI analysis.

## Dữ liệu
title, subtitle, author, publisher, published_at, updated_at, canonical_url, article_url, body, excerpt, image_url, source metadata.

## Chiến lược
RSS content → metadata/canonical → readability/extractor → Cheerio/parser phù hợp → fallback.

## Nếu không lấy được nội dung
Không tự giả định đã đọc bài đầy đủ. Chuyển REVIEW hoặc FAILED.

## Provenance
Luôn lưu original_url, source, collected_at, published_at, extraction_method.

## Nguyên tắc
Raw content là evidence/input cho pipeline, không được đưa nguyên văn thành bài publish.
