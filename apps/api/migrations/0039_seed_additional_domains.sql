INSERT INTO domains (
  code,
  slug,
  name,
  name_vi,
  image_url,
  description,
  sort_order,
  is_active,
  is_promoted,
  created_at,
  updated_at
)
VALUES
  (
    'TECH',
    'cong-nghe',
    'Công nghệ',
    'Công nghệ',
    'https://res.cloudinary.com/dtcvzzsvv/image/upload/v1792317376/domains/rinrof212akj6x4mmme8.png',
    'Kiến thức về công nghệ, trí tuệ nhân tạo, sản phẩm số và xu hướng đổi mới.',
    10,
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'SPORTS',
    'the-thao',
    'Thể thao',
    'Thể thao',
    'https://res.cloudinary.com/dtcvzzsvv/image/upload/v1792317378/domains/x9cglhn79sosbnq0gjij.png',
    'Tin tức, kiến thức và phân tích về thể thao, vận động, sức khỏe và lối sống năng động.',
    20,
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'LIFE',
    'doi-song',
    'Đời sống',
    'Đời sống',
    'https://res.cloudinary.com/dtcvzzsvv/image/upload/v1792317380/domains/oi096qfjxkiihswgroty.png',
    'Kiến thức thiết thực về đời sống, sức khỏe, gia đình và phát triển bản thân.',
    30,
    true,
    false,
    NOW(),
    NOW()
  )
ON CONFLICT (code) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  name_vi = EXCLUDED.name_vi,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  is_promoted = EXCLUDED.is_promoted,
  updated_at = NOW();
