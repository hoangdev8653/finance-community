-- Nội dung đầy đủ cho 6 bài học mẫu thuộc các Series công khai.
-- Chạy qua docker cp + psql để bảo toàn UTF-8 tiếng Việt.

UPDATE posts AS post
SET
  body = source.body,
  meta_description = source.meta_description
FROM (
  VALUES
    (
      'lap-ngan-sach-50-30-20',
      'Kế hoạch chi tiêu đơn giản, dễ áp dụng cho người mới bắt đầu.',
      $$
<p>Ngân sách 50/30/20 là một điểm khởi đầu dễ nhớ để bạn nhìn rõ tiền của mình đang đi đâu. Thay vì cố kiểm soát từng khoản chi nhỏ ngay từ ngày đầu, hãy chia thu nhập sau thuế thành ba nhóm: nhu cầu thiết yếu, mong muốn và tiết kiệm hoặc đầu tư.</p>
<h2>Nguyên tắc 50/30/20 là gì?</h2>
<p>Với 10.000.000 đồng thu nhập sau thuế mỗi tháng, bạn có thể tạm phân bổ 5.000.000 đồng cho nhu cầu thiết yếu, 3.000.000 đồng cho mong muốn và 2.000.000 đồng cho tiết kiệm hoặc đầu tư. Đây là khung định hướng, không phải một quy tắc cứng nhắc.</p>
<table><thead><tr><th>Nhóm chi tiêu</th><th>Tỷ lệ gợi ý</th><th>Ví dụ</th></tr></thead><tbody><tr><td>Nhu cầu thiết yếu</td><td>50%</td><td>Nhà ở, ăn uống, đi lại, hóa đơn</td></tr><tr><td>Mong muốn</td><td>30%</td><td>Giải trí, mua sắm, du lịch</td></tr><tr><td>Tiết kiệm &amp; đầu tư</td><td>20%</td><td>Quỹ khẩn cấp, bảo hiểm, quỹ đầu tư</td></tr></tbody></table>
<h2>Bắt đầu bằng số liệu thực tế</h2>
<p>Hãy xem lại lịch sử giao dịch của hai hoặc ba tháng gần nhất. Ghi lại các khoản chi lớn và nhóm chúng theo ba cột. Bạn không cần hoàn hảo; mục tiêu đầu tiên là nhận ra nhóm nào đang vượt quá khả năng của mình.</p>
<h3>Checklist trong 30 phút</h3>
<ul><li>Ghi tổng thu nhập sau thuế của tháng.</li><li>Liệt kê các khoản bắt buộc phải trả trước.</li><li>Đặt lệnh chuyển tự động cho khoản tiết kiệm ngay sau ngày nhận lương.</li><li>Chọn một khoản mong muốn để theo dõi trong tuần này.</li></ul>
<h2>Điều chỉnh tỷ lệ theo hoàn cảnh</h2>
<p>Nếu đang sống ở thành phố có chi phí nhà ở cao, phần nhu cầu có thể lớn hơn 50%. Khi đó hãy giảm phần mong muốn trước, thay vì dừng hoàn toàn khoản tiết kiệm. Một tỷ lệ bạn có thể duy trì trong nhiều tháng luôn tốt hơn một kế hoạch quá khắt khe rồi bỏ dở.</p>
<blockquote><p>Ngân sách tốt không làm bạn thấy bị hạn chế; nó cho bạn quyền chủ động chọn điều gì đáng để chi tiền.</p></blockquote>
<h2>Việc cần làm sau bài học</h2>
<p>Tạo ba danh mục trong ứng dụng ghi chú hoặc bảng tính, rồi ghi một giao dịch đầu tiên vào mỗi danh mục. Cuối tháng, hãy so sánh tỷ lệ thực tế với mục tiêu và chỉ điều chỉnh một thay đổi nhỏ cho tháng tiếp theo.</p>
$$
    ),
    (
      'xay-dung-quy-khan-cap',
      'Cách chuẩn bị lớp đệm tài chính an toàn trước khi đầu tư.',
      $$
<p>Quỹ khẩn cấp là khoản tiền dành riêng cho những tình huống bất ngờ như mất việc, chi phí y tế hoặc sửa chữa thiết yếu. Nó giúp bạn không phải vay nóng hay bán tài sản đầu tư vào đúng lúc thị trường không thuận lợi.</p>
<h2>Xác định mức quỹ phù hợp</h2>
<p>Hãy cộng các chi phí tối thiểu mỗi tháng: nhà ở, ăn uống, điện nước, đi lại, bảo hiểm và nghĩa vụ trả nợ. Mục tiêu ban đầu là một tháng chi phí thiết yếu; sau đó tăng dần lên ba đến sáu tháng tùy mức độ ổn định của thu nhập.</p>
<h2>Đặt quỹ ở đâu?</h2>
<p>Ưu tiên nơi an toàn và có thể rút nhanh: tài khoản tiết kiệm tách biệt hoặc tiền gửi ngắn hạn. Quỹ khẩn cấp không nhằm tối đa hóa lợi nhuận, vì vậy không nên đặt toàn bộ vào cổ phiếu hay tài sản biến động mạnh.</p>
<h3>Kế hoạch xây dựng trong 90 ngày</h3>
<ol><li>Tuần đầu: mở một tài khoản riêng và đặt tên rõ ràng.</li><li>Tháng đầu: chuyển một khoản cố định ngay khi nhận lương.</li><li>Tháng thứ hai: dùng khoản thưởng hoặc thu nhập thêm để tăng tốc.</li><li>Tháng thứ ba: xem lại chi phí thiết yếu và cập nhật mục tiêu.</li></ol>
<h2>Khi nào được dùng quỹ?</h2>
<p>Chỉ dùng cho sự kiện cần thiết, bất ngờ và không thể trì hoãn. Sau khi sử dụng, hãy lên lịch bổ sung lại quỹ như một hóa đơn ưu tiên. Quy tắc này giúp quỹ thực sự bảo vệ kế hoạch dài hạn của bạn.</p>
$$
    ),
    (
      'dat-muc-tieu-tai-chinh-theo-moc-thoi-gian',
      'Biến mong muốn thành kế hoạch tài chính có thể đo lường.',
      $$
<p>Một mục tiêu tài chính có ích cần trả lời được ba câu hỏi: cần bao nhiêu tiền, cần vào thời điểm nào và mỗi tháng phải đóng góp bao nhiêu. Viết mục tiêu cụ thể giúp bạn chọn công cụ tích lũy phù hợp thay vì ra quyết định theo cảm xúc.</p>
<h2>Chia mục tiêu theo thời gian</h2>
<p>Mục tiêu dưới ba năm thường cần ưu tiên tính an toàn và thanh khoản. Mục tiêu từ ba đến năm năm có thể cân nhắc kết hợp tiết kiệm và công cụ có biến động vừa phải. Với mục tiêu dài hơn năm năm, bạn có thêm thời gian để đối mặt với biến động thị trường.</p>
<h2>Công thức đóng góp hàng tháng</h2>
<p>Lấy số tiền mục tiêu trừ đi khoản bạn đã có, sau đó chia cho số tháng còn lại. Ví dụ: cần 120 triệu đồng sau 24 tháng và đã có 24 triệu đồng, bạn cần tích lũy khoảng 4 triệu đồng mỗi tháng, chưa tính lợi nhuận.</p>
<h3>Ba mục tiêu để bắt đầu</h3>
<ul><li>Một mục tiêu an toàn: quỹ khẩn cấp.</li><li>Một mục tiêu gần: khóa học, chuyến đi hoặc khoản mua sắm lớn.</li><li>Một mục tiêu dài hạn: nhà ở, nghỉ hưu hoặc tự do tài chính.</li></ul>
<h2>Rà soát theo quý</h2>
<p>Thu nhập, chi phí và ưu tiên đều thay đổi. Dành 20 phút mỗi quý để cập nhật số dư, thời hạn và khoản đóng góp. Nếu bị chậm tiến độ, hãy kéo dài thời gian hoặc tăng nguồn thu trước khi chấp nhận rủi ro cao hơn.</p>
$$
    ),
    (
      'chung-khoan-la-gi',
      'Nền tảng để bắt đầu tìm hiểu thị trường chứng khoán một cách có hệ thống.',
      $$
<p>Chứng khoán là bằng chứng về quyền sở hữu hoặc quyền lợi tài chính đối với một tổ chức phát hành. Khi mua cổ phiếu, bạn sở hữu một phần rất nhỏ của doanh nghiệp; khi mua trái phiếu, bạn đang cho tổ chức phát hành vay tiền theo điều kiện xác định.</p>
<h2>Ba nhóm tài sản thường gặp</h2>
<table><thead><tr><th>Loại tài sản</th><th>Bạn sở hữu gì?</th><th>Điểm cần lưu ý</th></tr></thead><tbody><tr><td>Cổ phiếu</td><td>Một phần doanh nghiệp</td><td>Giá có thể biến động mạnh</td></tr><tr><td>Trái phiếu</td><td>Khoản nợ của tổ chức phát hành</td><td>Quan tâm khả năng trả nợ và lãi suất</td></tr><tr><td>Quỹ đầu tư</td><td>Danh mục do tổ chức quản lý</td><td>Đọc kỹ chiến lược và chi phí quỹ</td></tr></tbody></table>
<h2>Lợi nhuận đến từ đâu?</h2>
<p>Nhà đầu tư có thể nhận cổ tức, tiền lãi hoặc chênh lệch giá khi bán tài sản. Tuy nhiên, lợi nhuận không được đảm bảo. Giá thị trường phản ánh kỳ vọng của nhiều người và có thể thay đổi nhanh khi thông tin mới xuất hiện.</p>
<h3>Rủi ro không chỉ là giá giảm</h3>
<ul><li>Rủi ro doanh nghiệp hoạt động kém hơn kỳ vọng.</li><li>Rủi ro thanh khoản khi cần bán nhưng ít người mua.</li><li>Rủi ro tập trung khi đặt quá nhiều tiền vào một mã.</li><li>Rủi ro hành vi khi mua bán theo tin đồn hoặc cảm xúc.</li></ul>
<h2>Trước khi mở tài khoản</h2>
<p>Hãy hoàn thành quỹ khẩn cấp cơ bản, xác định mục tiêu đầu tư và thời gian nắm giữ. Chỉ dùng khoản tiền không cần cho chi tiêu thiết yếu trong ngắn hạn. Bước chuẩn bị này quan trọng hơn việc chọn mã đầu tiên.</p>
<blockquote><p>Đầu tư không bắt đầu bằng câu hỏi “mã nào tăng”, mà bắt đầu bằng câu hỏi “mục tiêu của mình là gì và mình chịu được mức rủi ro nào”.</p></blockquote>
<h2>Bài tập sau khi đọc</h2>
<p>Viết ra một mục tiêu đầu tư trong năm năm tới, số tiền dự kiến và mức giảm giá tạm thời bạn có thể chấp nhận mà vẫn giữ kế hoạch. Đây sẽ là nền tảng cho hai bài học tiếp theo.</p>
$$
    ),
    (
      'doc-bao-cao-tai-chinh-co-ban',
      'Bắt đầu đọc báo cáo tài chính bằng ba chỉ số nền tảng.',
      $$
<p>Báo cáo tài chính không cần được đọc như một cuốn sách từ đầu đến cuối. Với người mới, hãy bắt đầu bằng ba câu hỏi: doanh nghiệp có tăng doanh thu không, có tạo ra lợi nhuận bền vững không và tiền mặt có thực sự về doanh nghiệp không?</p>
<h2>Doanh thu: quy mô hoạt động</h2>
<p>So sánh doanh thu cùng kỳ giữa nhiều năm để biết hoạt động kinh doanh đang mở rộng hay thu hẹp. Đừng chỉ nhìn một quý riêng lẻ; tính mùa vụ có thể làm con số thay đổi đáng kể.</p>
<h2>Lợi nhuận: chất lượng kinh doanh</h2>
<p>Lợi nhuận sau thuế cho biết phần còn lại sau khi trừ chi phí. Hãy quan sát biên lợi nhuận, tức là lợi nhuận trên doanh thu. Biên ổn định hoặc cải thiện thường đáng chú ý hơn một con số lợi nhuận tăng đột biến một lần.</p>
<h2>Dòng tiền: kiểm tra tiền thật</h2>
<p>Dòng tiền từ hoạt động kinh doanh cho biết doanh nghiệp có thu được tiền từ hoạt động cốt lõi hay không. Một doanh nghiệp có lợi nhuận kế toán nhưng dòng tiền yếu kéo dài cần được xem kỹ hơn.</p>
<h3>Mẫu ghi chú một trang</h3>
<ul><li>Doanh thu ba năm gần nhất tăng hay giảm?</li><li>Biên lợi nhuận đang ổn định, cải thiện hay xấu đi?</li><li>Dòng tiền hoạt động có cùng chiều với lợi nhuận không?</li><li>Khoản nợ nào có thể gây áp lực trong tương lai?</li></ul>
<h2>Tránh kết luận quá sớm</h2>
<p>Ba chỉ số trên chỉ là điểm xuất phát. Sau đó, hãy đọc thuyết minh báo cáo, tìm hiểu ngành nghề và so sánh với các doanh nghiệp cùng ngành. Mục tiêu là xây dựng câu hỏi tốt hơn, không phải tìm một chỉ số thần kỳ.</p>
$$
    ),
    (
      'da-dang-hoa-danh-muc-dau-tu',
      'Nguyên tắc giảm rủi ro tập trung cho người mới đầu tư.',
      $$
<p>Đa dạng hóa là cách tránh việc kết quả tài chính của bạn phụ thuộc hoàn toàn vào một doanh nghiệp, một ngành hoặc một loại tài sản. Nó không loại bỏ mọi rủi ro, nhưng giúp một quyết định sai hoặc một biến cố riêng lẻ không làm hỏng toàn bộ kế hoạch.</p>
<h2>Đa dạng hóa không phải mua thật nhiều mã</h2>
<p>Một danh mục có mười cổ phiếu cùng ngành vẫn có thể chịu rủi ro tập trung cao. Hãy xem sự khác nhau về ngành nghề, khu vực, loại tài sản và động lực tạo lợi nhuận của từng khoản nắm giữ.</p>
<h2>Bắt đầu từ phân bổ tài sản</h2>
<p>Trước khi chọn từng mã, xác định tỷ trọng giữa tiền mặt, trái phiếu và cổ phiếu phù hợp với thời hạn mục tiêu. Người có mục tiêu gần thường cần phần tài sản an toàn lớn hơn người đầu tư dài hạn.</p>
<h3>Ba câu hỏi kiểm tra danh mục</h3>
<ol><li>Nếu một ngành giảm mạnh, danh mục của tôi ảnh hưởng bao nhiêu?</li><li>Tôi có khoản dự phòng cho nhu cầu ngắn hạn không?</li><li>Tỷ trọng lớn nhất có vượt mức khiến tôi mất ngủ không?</li></ol>
<h2>Tái cân bằng có kỷ luật</h2>
<p>Sau một thời gian, tài sản tăng giá có thể chiếm tỷ trọng lớn hơn kế hoạch ban đầu. Tái cân bằng định kỳ là đưa danh mục về tỷ trọng mục tiêu bằng cách bổ sung vào phần đang thiếu hoặc giảm bớt phần đang quá lớn.</p>
<blockquote><p>Một danh mục tốt không phải là danh mục có nhiều mã nhất, mà là danh mục phù hợp nhất với mục tiêu và khả năng chịu rủi ro của bạn.</p></blockquote>
<h2>Việc cần làm tuần này</h2>
<p>Liệt kê tất cả tài sản bạn đang nắm giữ, ghi tỷ trọng của từng loại và đánh dấu phần nào có cùng rủi ro. Chỉ riêng bài tập này đã giúp nhiều nhà đầu tư nhận ra mức tập trung ngoài ý muốn.</p>
$$
    )
) AS source(slug, meta_description, body)
WHERE post.slug = source.slug
  AND post.content_type = 'SERIES';
