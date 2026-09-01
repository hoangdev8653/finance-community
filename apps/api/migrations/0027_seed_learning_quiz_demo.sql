DO $$
DECLARE lesson_id uuid; quiz_id uuid;
BEGIN
  SELECT id INTO lesson_id FROM posts WHERE content_type = 'SERIES' AND status = 'PUBLISHED' ORDER BY created_at LIMIT 1;
  IF lesson_id IS NOT NULL THEN
    INSERT INTO quizzes (post_id, title, description)
    VALUES (lesson_id, 'Kiểm tra nhanh: Nền tảng tài chính cá nhân', 'Trả lời 3 câu hỏi để củng cố nội dung vừa học.')
    ON CONFLICT (post_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, updated_at = now()
    RETURNING id INTO quiz_id;
    DELETE FROM quiz_questions WHERE quiz_questions.quiz_id IN (SELECT id FROM quizzes WHERE post_id = lesson_id);
    INSERT INTO quiz_questions (quiz_id, prompt, options, explanation, sort_order) VALUES
      (quiz_id, 'Quỹ khẩn cấp nên ưu tiên mục tiêu nào?', '[{"id":"a","label":"Chi tiêu thiết yếu 3–6 tháng","isCorrect":true},{"id":"b","label":"Mua cổ phiếu theo tin đồn","isCorrect":false},{"id":"c","label":"Vay thêm để đầu tư","isCorrect":false}]', 'Quỹ khẩn cấp giúp duy trì chi tiêu thiết yếu khi thu nhập bị gián đoạn.', 0),
      (quiz_id, 'Lãi kép có nghĩa là gì?', '[{"id":"a","label":"Lãi chỉ tính trên vốn gốc","isCorrect":false},{"id":"b","label":"Lãi được tái đầu tư để tiếp tục sinh lãi","isCorrect":true},{"id":"c","label":"Không có rủi ro đầu tư","isCorrect":false}]', 'Lãi được cộng vào vốn và tiếp tục tạo ra lợi nhuận trong các kỳ sau.', 1),
      (quiz_id, 'Khi định giá theo P/E, công thức cơ bản là gì?', '[{"id":"a","label":"EPS × P/E mục tiêu","isCorrect":true},{"id":"b","label":"Doanh thu ÷ tài sản","isCorrect":false},{"id":"c","label":"Cổ tức − lãi suất","isCorrect":false}]', 'Giá hợp lý theo P/E thường được ước tính bằng EPS nhân với P/E mục tiêu.', 2);
  END IF;
END $$;
