# Finance Community — Knowledge & Learning Platform

Nền tảng học kiến thức thực tế qua các series bài học ngắn. Tài chính là một nhóm chủ đề chính, cùng với kỹ năng sống, sức khỏe, công việc, công nghệ và các kiến thức đời sống khác.

Sản phẩm tập trung vào nội dung Learning do nền tảng tự biên soạn hoặc có quyền sử dụng rõ ràng. Luồng RSS/News đã được loại khỏi runtime hiện tại.

Các content type chính:

- `SERIES` / `LESSON`: nội dung học tập có cấu trúc.
- `COMMUNITY`: thảo luận và nội dung do người dùng tạo.
- `NEWS`: tùy chọn phụ, tách khỏi quy trình xuất bản Learning.

Kiến trúc taxonomy dùng `Category → Series → Lesson`, giúp thêm chủ đề mới mà không cần tạo module riêng.

A high-precision financial knowledge and community platform for editorial research, valuation models, and collaborative market intelligence.

---

## 🚀 Hướng dẫn Chạy Dự Án (Quick Start Guide)

### 📋 1. Yêu cầu Môi trường (Prerequisites)
- **Node.js**: Phiên bản `>= 20.x`
- **npm** / **pnpm** / **yarn**
- **Docker & Docker Compose** (để chạy cơ sở dữ liệu PostgreSQL cục bộ)

---

### 🗄️ 2. Khởi động Cơ sở Dữ liệu (Database)

Dự án đã cấu hình sẵn Docker Compose tự động nạp toàn bộ Schema cơ sở dữ liệu ([docs/DATABASE_SCHEMA.sql](file:///d:/tools/finance-community/docs/DATABASE_SCHEMA.sql)).

Chạy lệnh tại thư mục gốc của dự án:
```bash
# Khởi động PostgreSQL ở chế độ chạy ngầm
docker compose up -d postgres
```
* **Host**: `localhost:5432`
* **Database**: `finance_db`
* **User/Password**: `postgres` / `postgres`

*(Tùy chọn) Nạp dữ liệu mẫu ban đầu:*
```bash
docker exec -i finance-community-postgres psql -U postgres -d finance_db < docs/SEED_DATA.sql
```

---

### ⚙️ 3. Khởi động Backend API (NestJS)

Mở một cửa sổ Terminal:
```bash
# Di chuyển vào thư mục API
cd apps/api

# Cài đặt thư viện phụ thuộc
npm install

# Tạo file cấu hình môi trường từ mẫu
cp .env.example .env

# Chạy Backend ở chế độ phát triển (Hot reload)
npm run start:dev
```
- 🌐 **API Base URL**: `http://localhost:4000/api/v1`
- 📚 **Tài liệu Swagger UI**: `http://localhost:4000/api/docs`
- 📄 **OpenAPI Spec (JSON)**: `http://localhost:4000/api/docs-json`

---

### 💻 4. Khởi động Frontend Web (Next.js)

Mở một cửa sổ Terminal thứ hai:
```bash
# Di chuyển vào thư mục Web
cd apps/web

# Cài đặt thư viện phụ thuộc
npm install

# Chạy ứng dụng Next.js (App Router)
npm run dev
```
- 🖥️ **Giao diện Web**: `http://localhost:3000`

---

### 📬 5. Kiểm thử API với Postman

Dự án đã chuẩn bị sẵn bộ Collection hoàn chỉnh gồm hơn 40 API chuẩn RESTful:
1. Mở ứng dụng **Postman**.
2. Bấm nút **Import** ở góc trên bên trái.
3. Chọn file: [docs/finance_community_postman_collection.json](file:///d:/tools/finance-community/docs/finance_community_postman_collection.json).
4. Biến môi trường mặc định:
   - `{{baseUrl}}`: `http://localhost:4000`
   - `{{token}}`: Dán chuỗi Bearer JWT Token sau khi đăng nhập.

---

### 🐳 6. Chạy toàn bộ hệ thống bằng Docker (Full Stack)

Nếu muốn chạy toàn bộ cả Database và Backend bằng một lệnh duy nhất:
```bash
docker compose up --build
```

---

## 🏗️ Cấu trúc Thư mục (Monorepo Architecture)

```text
finance-community/
├── apps/
│   ├── api/                 # Backend NestJS REST API
│   │   ├── src/modules/     # Auth, Users, Posts, Comments, Reactions, Series...
│   │   └── Dockerfile
│   └── web/                 # Frontend Next.js 15+ (App Router, Tailwind CSS)
│       ├── app/             # App Router Pages & Layouts
│       ├── components/      # UI, Navigation, Feedback, Content Widgets
│       ├── lib/i18n/        # Bộ từ điển tiếng Việt (vi.ts) & useTranslation
│       └── stores/          # Zustand State Stores
├── docs/                    # Tài liệu kiến trúc, Database Schema, Postman Collection
├── .agents/rules/           # Quy tắc kỹ thuật AI (4pt Grid, Postman Sync...)
└── docker-compose.yml       # Cấu hình container PostgreSQL & Backend
```

---

## 🧪 Kiểm thử & Xác thực Mã nguồn (Testing)

```bash
# Chạy kiểm thử Backend
cd apps/api && npm run test

# Chạy kiểm tra kiểu dữ liệu Frontend
cd apps/web && npm run typecheck

# Chạy Unit Tests Frontend
cd apps/web && npm run test
```


cd D:\Web_Projects\finance-community
docker compose up -d --build --force-recreate api
