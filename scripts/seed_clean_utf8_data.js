const { Client } = require('../apps/api/node_modules/pg');

async function seedCleanUtf8Data() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/finance_db' });
  await client.connect();
  console.log('Connected to PostgreSQL database');

  await client.query("SET client_encoding = 'UTF8';");

  // 1. Get or Ensure Admin User ID
  const adminRes = await client.query("SELECT id FROM users WHERE email = 'admin@financepulse.vn'");
  const adminId = adminRes.rows[0]?.id || '11111111-aaaa-43f7-9abc-111111111111';

  // 2. Clean up corrupted question-mark posts
  console.log('Updating core community posts with pristine Vietnamese UTF-8 content...');
  
  const communityPosts = [
    {
      id: '00000000-0000-4000-8000-000000000061',
      title: 'Fed chính thức hạ lãi suất: Bước ngoặt nới lỏng chính sách tiền tệ toàn cầu và tác động đến các thị trường mới nổi',
      slug: 'fed-chinh-thuc-ha-lai-suat-buoc-ngoat-chinh-sach-tien-te-toan-cau',
      excerpt: 'Phân tích toàn diện quyết định nới lỏng tiền tệ của Cục Dự trữ Liên bang Mỹ (Fed), đánh giá sự chuyển dịch dòng vốn quốc tế, áp lực tỷ giá USD/VND và triển vọng thị trường chứng khoán Việt Nam.',
      body: `<h3>1. Bối cảnh quyết định hạ lãi suất của Fed</h3>
<p>Quyết định hạ lãi suất chuẩn của Cục Dự trữ Liên bang Mỹ (Fed) đánh dấu bước ngoặt quan trọng sau chu kỳ thắt chặt tiền tệ mạnh nhất trong hơn 4 thập kỷ qua. Động thái này diễn ra trong bối cảnh lạm phát tại Mỹ đã hạ nhiệt về gần mức mục tiêu 2%, trong khi thị trường lao động bắt đầu xuất hiện những tín hiệu suy yếu có kiểm soát.</p>

<h3>2. Cơ chế tác động đến các thị trường mới nổi (Emerging Markets)</h3>
<p>Khi chênh lệch lãi suất giữa USD và đồng nội tệ của các quốc gia đang phát triển thu hẹp, áp lực mất giá tỷ giá hối đoái sẽ giảm bớt rõ rệt. Điều này tạo điều kiện thuận lợi cho các ngân hàng trung ương tại khu vực châu Á, đặc biệt là Ngân hàng Nhà nước Việt Nam (SBV), có thêm dư địa điều hành chính sách tiền tệ theo hướng hỗ trợ tăng trưởng kinh tế và hạ mặt bằng lãi suất cho vay.</p>

<h3>3. Tác động cụ thể đến kinh tế & thị trường chứng khoán Việt Nam</h3>
<ul>
  <li><strong>Dòng vốn ngoại (Foreign Capital Inflows):</strong> Áp lực rút ròng của khối ngoại giảm bớt, mở ra cơ hội thu hút dòng vốn FII (đầu tư gián tiếp) quay trở lại nhóm cổ phiếu vốn hóa lớn VN30.</li>
  <li><strong>Doanh nghiệp xuất nhập khẩu:</strong> Doanh nghiệp có dư nợ vay bằng đồng USD (như thép, điện, hàng không) sẽ giảm đáng kể chi phí tài chính và lỗ chênh lệch tỷ giá.</li>
  <li><strong>Thanh khoản hệ thống ngân hàng:</strong> Dự trữ ngoại hối có cơ hội được củng cố khi SBV có thể mua ròng USD nhằm bơm thanh khoản tiền đồng ra nền kinh tế.</li>
</ul>

<h3>4. Khuyến nghị chiến lược cho nhà đầu tư</h3>
<p>Nhà đầu tư nên tập trung vào các nhóm ngành hưởng lợi trực tiếp từ chu kỳ lãi suất thấp bao gồm: Chứng khoán, Bất động sản khu công nghiệp, Sản xuất xuất khẩu và Bán lẻ tiêu dùng phục hồi.</p>`,
      category_slug: 'macro-strategy',
      tags: ['vi-mo-viet-nam', 'chinh-sach-fed', 'ty-gia-usdvnd']
    },
    {
      id: '00000000-0000-4000-8000-000000000062',
      title: 'Dòng vốn FDI và Chu kỳ Tín dụng mới: Động lực bứt phá của nhóm ngành sản xuất & xuất khẩu Việt Nam',
      slug: 'dong-von-fdi-va-chu-ky-tin-dung-moi-dong-luc-but-pha-san-xuat',
      excerpt: 'Đánh giá chuyên sâu về tác động của dòng vốn đầu tư trực tiếp nước ngoài (FDI) thế hệ mới kết hợp chính sách tín dụng hỗ trợ sản xuất kinh doanh.',
      body: `<h3>1. Làn sóng FDI thế hệ mới vào Việt Nam</h3>
<p>Dòng vốn FDI đăng ký và giải ngân vào Việt Nam tiếp tục duy trì đà tăng trưởng ấn tượng, tập trung mạnh vào các lĩnh vực công nghệ cao, bán dẫn, linh kiện điện tử và năng lượng tái tạo. Các tập đoàn đa quốc gia đang đẩy mạnh chiến lược đa dạng hóa chuỗi cung ứng toàn cầu.</p>

<h3>2. Sự phối hợp giữa chính sách tài khóa và tiền tệ</h3>
<p>Chính phủ và Ngân hàng Nhà nước đang triển khai đồng bộ các gói tín dụng ưu đãi cho lĩnh vực sản xuất công nghiệp phụ trợ, xuất khẩu và chuyển đổi xanh, tạo đòn bẩy vững chắc cho doanh nghiệp nội địa vươn lên tham gia sâu vào chuỗi giá trị toàn cầu.</p>`,
      category_slug: 'equity-research',
      tags: ['dong-von-fdi', 'vi-mo-viet-nam', 'tin-dung-ngan-hang']
    },
    {
      id: '00000000-0000-4000-8000-000000000063',
      title: 'Bức tranh NIM và Chất lượng Tài sản ngành Ngân hàng: Dự báo xu hướng phân hóa mạnh mẽ',
      slug: 'buc-tranh-nim-va-chat-luong-tai-san-nganh-ngan-hang',
      excerpt: 'Báo cáo phân tích chuyên sâu về biên lãi thuần (NIM), tỷ lệ nợ xấu (NPL) và khả năng duy trì tăng trưởng lợi nhuận của các ngân hàng thương mại.',
      body: `<h3>1. Xu hướng phục hồi của biên lãi thuần (NIM)</h3>
<p>Biên lãi thuần NIM của toàn ngành ngân hàng dự kiến sẽ chạm đáy và hồi phục nhẹ nhờ chi phí huy động vốn (COF) duy trì ở mức thấp kỷ lục, trong khi nhu cầu tín dụng từ khối doanh nghiệp bán lẻ và sản xuất bắt đầu tăng tốc vào nửa cuối năm.</p>

<h3>2. Quản trị rủi ro nợ xấu và bộ đệm trích lập dự phòng</h3>
<p>Các ngân hàng có tỷ lệ bao phủ nợ xấu (LLR) cao và danh mục cho vay thận trọng sẽ có lợi thế vượt trội trong việc kiểm soát chi phí tín dụng, từ đó đảm bảo tăng trưởng lợi nhuận ròng bền vững.</p>`,
      category_slug: 'banking-sector',
      tags: ['tin-dung-ngan-hang', 'trai-phieu-doanh-nghiep']
    }
  ];

  for (const p of communityPosts) {
    const catRes = await client.query("SELECT id FROM categories WHERE slug = $1", [p.category_slug]);
    const catId = catRes.rows[0]?.id || null;

    await client.query(`
      INSERT INTO posts (id, author_id, content_type, title, slug, body, meta_description, category_id, status, moderation_status, view_count, published_at, created_at, updated_at)
      VALUES ($1, $2, 'COMMUNITY', $3, $4, $5, $6, $7, 'PUBLISHED', 'APPROVED', 1250, NOW() - INTERVAL '1 day', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        body = EXCLUDED.body,
        meta_description = EXCLUDED.meta_description,
        category_id = EXCLUDED.category_id,
        status = 'PUBLISHED',
        moderation_status = 'APPROVED',
        updated_at = NOW();
    `, [p.id, adminId, p.title, p.slug, p.body, p.excerpt, catId]);
  }

  // 3. Seed Comprehensive Series Chapters
  console.log('Seeding Educational Series curriculum chapters...');

  const seriesCategories = [
    {
      id: '00000000-0000-4000-8000-000000000041',
      name: 'Cẩm Nang BCTC',
      slug: 'financial-statement-analysis',
      scope: 'SERIES',
      description: 'Chuỗi bài phân tích chuyên sâu Bảng CĐKT, Báo cáo KQKD và Lưu chuyển tiền tệ.',
      chapters: [
        {
          id: '10000000-0000-4000-8000-000000000001',
          title: 'Chương 1: Giải mã Bảng Cân đối Kế toán & Đánh giá Sức khỏe Tài chính Doanh nghiệp',
          slug: 'chuong-1-giai-ma-bang-can-doi-ke-toan',
          excerpt: 'Nắm vững cấu trúc tài sản ngắn hạn, nợ phải trả, vốn chủ sở hữu và các tỷ số đòn bẩy tài chính quan trọng để nhận diện rủi ro tiềm ẩn.',
          body: `<p>Bảng Cân đối Kế toán phản ánh bức tranh toàn cảnh về tình hình tài chính của doanh nghiệp tại một thời điểm cụ thể. Cân đối kế toán luôn tuân thủ nguyên tắc vàng: <strong>Tổng Tài Sản = Tổng Nợ Phải Trả + Vốn Chủ Sở Hữu</strong>.</p>
<h4>Nội dung trọng tâm:</h4>
<ul>
  <li>Phân tích chất lượng tài sản: Các khoản phải thu, hàng tồn kho và tài sản dở dang.</li>
  <li>Đánh giá cấu trúc nợ: Tỷ lệ Nợ vay/Vốn chủ sở hữu (D/E), Khả năng thanh toán hiện hành (Current Ratio).</li>
  <li>Dấu hiệu suy giảm chất lượng tài sản và cảnh báo rủi ro thanh khoản.</li>
</ul>`
        },
        {
          id: '10000000-0000-4000-8000-000000000002',
          title: 'Chương 2: Bóc tách Báo cáo Kết quả Kinh doanh & Chất lượng Lợi nhuận Ròng',
          slug: 'chuong-2-boc-tach-bao-cao-ket-qua-kinh-doanh',
          excerpt: 'Phân tích doanh thu thuần, biên lợi nhuận gộp, chi phí hoạt động SG&A và đánh giá tính bền vững của dòng lợi nhuận cốt lõi.',
          body: `<p>Báo cáo Kết quả Kinh doanh ghi nhận hiệu quả hoạt động của doanh nghiệp trong một thời kỳ kế toán. Điều quan trọng nhất không phải là con số lợi nhuận cao hay thấp, mà là <strong>Chất lượng của dòng lợi nhuận đó đến từ đâu</strong>.</p>
<h4>Nội dung trọng tâm:</h4>
<ul>
  <li>Phân biệt lợi nhuận từ hoạt động cốt lõi (Core Operating Profit) và lợi nhuận bất thường.</li>
  <li>Phân tích biên lợi nhuận gộp (Gross Margin) và xu hướng giá vốn hàng bán (COGS).</li>
  <li>Kiểm tra tỷ lệ đòn bẩy hoạt động (Operating Leverage) và quản trị chi phí SG&A.</li>
</ul>`
        },
        {
          id: '10000000-0000-4000-8000-000000000003',
          title: 'Chương 3: Phân tích Lưu chuyển Tiền tệ (Cash Flow) - Máu nuôi Doanh nghiệp',
          slug: 'chuong-3-phan-tich-luu-chuyen-tien-te-cash-flow',
          excerpt: 'Hiểu rõ dòng tiền thuần từ hoạt động kinh doanh (CFO), dòng tiền đầu tư (CFI) và dòng tiền tài chính (CFF) để tránh bẫy lợi nhuận trên giấy.',
          body: `<p>Một doanh nghiệp có thể báo cáo lợi nhuận rất cao trên Báo cáo KQKD nhưng vẫn có thể rơi vào tình trạng phá sản nếu không có dòng tiền thực tế. <strong>Cash is King - Tiền mặt là Vua</strong>.</p>
<h4>Nội dung trọng tâm:</h4>
<ul>
  <li>Phân tích dòng tiền kinh doanh CFO: Đối chiếu giữa Lợi nhuận kế toán và Tiền mặt thực thu.</li>
  <li>Dòng tiền đầu tư CFI: Nhận diện doanh nghiệp đang trong chu kỳ mở rộng CAPEX hay thoái vốn.</li>
  <li>Dòng tiền tự do (Free Cash Flow - FCF): Thước đo chuẩn mực cho khả năng trả cổ tức và định giá.</li>
</ul>`
        },
        {
          id: '10000000-0000-4000-8000-000000000004',
          title: 'Chương 4: Nhận diện các Thủ thuật Xào nấu BCTC qua Chỉ số Cảnh báo Sớm',
          slug: 'chuong-4-nhan-dien-thu-thuat-xao-nau-bctc',
          excerpt: 'Học cách phát hiện dấu hiệu ghi nhận doanh thu ảo, vốn hóa chi phí, giao dịch với các bên liên quan và mô hình Beneish M-Score.',
          body: `<p>Trang bị cho nhà đầu tư bộ công cụ và các tín hiệu cảnh báo đỏ (Red Flags) để tránh những doanh nghiệp có rủi ro gian lận kế toán trên thị trường chứng khoán.</p>
<h4>Nội dung trọng tâm:</h4>
<ul>
  <li>Chỉ số DSO (Số ngày thu tiền bình quân) tăng đột biến bất thường.</li>
  <li>Tỷ lệ Tiền mặt/Doanh thu giảm liên tục trong khi các khoản phải thu phình to.</li>
  <li>Ứng dụng mô hình Beneish M-Score và Altman Z-Score vào thực tế doanh nghiệp Việt Nam.</li>
</ul>`
        }
      ]
    },
    {
      id: '00000000-0000-4000-8000-000000000042',
      name: 'Mô Hình Định Giá',
      slug: 'valuation-mastery',
      scope: 'SERIES',
      description: 'Hướng dẫn xây dựng mô hình DCF, định giá so sánh P/E, EV/EBITDA bài bản.',
      chapters: [
        {
          id: '20000000-0000-4000-8000-000000000001',
          title: 'Chương 1: Nguyên lý Chiết khấu Dòng tiền DCF & Tính toán Chi phí Vốn WACC',
          slug: 'chuong-1-nguyen-ly-chiet-khau-dong-tien-dcf-wacc',
          excerpt: 'Xây dựng nền tảng định giá giá trị nội tại: Dự báo dòng tiền tự do FCFF, chi phí vốn chủ sở hữu theo CAPM và tỷ trọng nợ.',
          body: `<p>Mô hình chiết khấu dòng tiền (Discounted Cash Flow - DCF) là nền tảng cốt lõi trong phân tích đầu tư giá trị, giúp xác định giá trị nội tại thực sự của một cổ phiếu độc lập với tâm lý thị trường ngắn hạn.</p>`
        },
        {
          id: '20000000-0000-4000-8000-000000000002',
          title: 'Chương 2: Phương pháp Định giá Tương đối P/E, P/B và EV/EBITDA Thực chiến',
          slug: 'chuong-2-phuong-phap-dinh-gia-tuong-doi-pe-pb-ev-ebitda',
          excerpt: 'So sánh bội số định giá giữa các doanh nghiệp cùng ngành, loại bỏ yếu tố bất thường và xác định biên độ an toàn (Margin of Safety).',
          body: `<p>Phương pháp định giá tương đối cung cấp góc nhìn nhanh chóng và thực tế về mức độ đắt/rẻ của cổ phiếu so với nhóm ngành và lịch sử định giá của chính doanh nghiệp.</p>`
        },
        {
          id: '20000000-0000-4000-8000-000000000003',
          title: 'Chương 3: Thực hành Xây dựng Mô hình 3 Báo cáo Tài chính Dự phóng trên Excel',
          slug: 'chuong-3-thuc-hanh-xay-dung-mo-hinh-3-bao-cao-tren-excel',
          excerpt: 'Từng bước liên kết Bảng CĐKT, Báo cáo KQKD và Lưu chuyển tiền tệ để tạo mô hình tài chính động phục vụ ra quyết định đầu tư.',
          body: `<p>Hướng dẫn chi tiết từ việc thu thập dữ liệu lịch sử 5 năm đến thiết lập các giả định doanh thu, chi phí, vốn lưu động và hoàn thiện mô hình định giá chuyên nghiệp.</p>`
        }
      ]
    },
    {
      id: '00000000-0000-4000-8000-000000000043',
      name: 'Kinh Tế Vĩ Mô',
      slug: 'macro-cycles-framework',
      scope: 'SERIES',
      description: 'Nhận diện chu kỳ kinh tế, lãi suất, lạm phát và dòng tiền dịch chuyển.',
      chapters: [
        {
          id: '30000000-0000-4000-8000-000000000001',
          title: 'Chương 1: 4 Giai đoạn của Chu kỳ Kinh tế & Phân bổ Lớp Tài sản',
          slug: 'chuong-1-4-giai-doan-chu-ky-kinh-te-phan-bo-tai-san',
          excerpt: 'Hiểu rõ các giai đoạn Phục hồi, Tăng trưởng, Đạt đỉnh và Suy thoái để luân chuyển vốn tối ưu giữa Cổ phiếu, Trái phiếu, Tiền mặt và Vàng.',
          body: `<p>Khung phân tích chu kỳ vĩ mô giúp nhà đầu tư luôn đi trước xu hướng lớn của thị trường và phòng ngừa rủi ro suy thoái kinh tế từ sớm.</p>`
        },
        {
          id: '30000000-0000-4000-8000-000000000002',
          title: 'Chương 2: Lãi suất, Lạm phát và Tác động của Chính sách Tiền tệ',
          slug: 'chuong-2-lai-suat-lam-phat-chinh-sach-tien-te',
          excerpt: 'Cách đọc bảng cân đối kế toán của ngân hàng trung ương, đo lường cung tiền M2 và đánh giá thanh khoản liên ngân hàng.',
          body: `<p>Lãi suất là lực hút trọng trường của mọi lớp tài sản tài chính. Hiểu rõ chính sách lãi suất giúp nhà đầu tư xác định đúng thời điểm tham gia thị trường.</p>`
        }
      ]
    }
  ];

  for (const s of seriesCategories) {
    // 1. Ensure category exists
    await client.query(`
      INSERT INTO categories (id, name, slug, scope, description, sort_order, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 1, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        scope = EXCLUDED.scope,
        description = EXCLUDED.description,
        updated_at = NOW();
    `, [s.id, s.name, s.slug, s.scope, s.description]);

    // 2. Insert Chapters
    for (const [index, ch] of s.chapters.entries()) {
      await client.query(`
        INSERT INTO posts (id, author_id, content_type, title, slug, body, meta_description, category_id, status, moderation_status, view_count, published_at, created_at, updated_at)
        VALUES ($1, $2, 'SERIES', $3, $4, $5, $6, $7, 'PUBLISHED', 'APPROVED', $8, NOW() - INTERVAL '1 day' * $9, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          body = EXCLUDED.body,
          meta_description = EXCLUDED.meta_description,
          category_id = EXCLUDED.category_id,
          content_type = 'SERIES',
          status = 'PUBLISHED',
          moderation_status = 'APPROVED',
          updated_at = NOW();
      `, [ch.id, adminId, ch.title, ch.slug, ch.body, ch.excerpt, s.id, 850 + index * 120, index + 1]);
    }
  }

  console.log('✅ Successfully seeded clean UTF-8 Vietnamese data & full Series chapters!');
  await client.end();
}

seedCleanUtf8Data().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
