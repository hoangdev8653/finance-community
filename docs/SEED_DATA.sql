-- ============================================================================
-- Finance Community Platform — Seed Data for Demo & Development
-- ============================================================================

-- 1. Insert Demo Users
INSERT INTO users (id, email, status) VALUES
    ('987fcdeb-51a2-43f7-9abc-1234567890ab', 'joan.names@financepulse.internal', 'ACTIVE'),
    ('12345678-51a2-43f7-9abc-1234567890cd', 'antona.names@financepulse.internal', 'ACTIVE'),
    ('55556666-51a2-43f7-9abc-1234567890ef', 'analyst.senior@financepulse.internal', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert User Profiles
INSERT INTO profiles (id, user_id, username, display_name, bio) VALUES
    (gen_random_uuid(), '987fcdeb-51a2-43f7-9abc-1234567890ab', 'joan_names', 'Joan Names', 'Senior Macro & Quantitative Analyst at Finance Pulse.'),
    (gen_random_uuid(), '12345678-51a2-43f7-9abc-1234567890cd', 'antona_names', 'Antona Names', 'Valuation & Equities Lead with institutional research focus.'),
    (gen_random_uuid(), '55556666-51a2-43f7-9abc-1234567890ef', 'analyst_senior', 'Senior Analyst', 'Fixed income, derivatives, and liquidity modeling.')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, scope, description, sort_order) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Investing', 'investing', 'COMMUNITY', 'Investment theses, portfolio allocation, and strategies.', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Personal Finance', 'personal-finance', 'COMMUNITY', 'Wealth management, budgeting, and savings.', 2),
    ('c3333333-3333-3333-3333-333333333333', 'Stock Market', 'stock-market', 'COMMUNITY', 'Equities, sector breakdown, and earnings analyses.', 3),
    ('c4444444-4444-4444-4444-444444444444', 'Crypto', 'crypto', 'COMMUNITY', 'Digital assets, blockchain architecture, and tokenomics.', 4),
    ('c5555555-5555-5555-5555-555555555555', 'Macroeconomics', 'macroeconomics', 'COMMUNITY', 'Central bank policy, yield curve, and GDP growth.', 5),
    ('c6666666-6666-6666-6666-666666666666', 'Educational Series', 'educational-series', 'SERIES', 'Structured masterclasses and learning tracks.', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Tags
INSERT INTO tags (id, name, slug) VALUES
    (gen_random_uuid(), 'investing', 'investing'),
    (gen_random_uuid(), 'personal-finance', 'personal-finance'),
    (gen_random_uuid(), 'stock-market', 'stock-market'),
    (gen_random_uuid(), 'crypto', 'crypto'),
    (gen_random_uuid(), 'valuation', 'valuation'),
    (gen_random_uuid(), 'macroeconomics', 'macroeconomics'),
    (gen_random_uuid(), 'derivatives', 'derivatives')
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Posts
INSERT INTO posts (id, author_id, content_type, title, slug, body, category_id, status, meta_title, meta_description, view_count, published_at, created_at, updated_at) VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        '987fcdeb-51a2-43f7-9abc-1234567890ab',
        'COMMUNITY',
        'Financial Analysis and Market Intelligence',
        'financial-analysis-market-intelligence',
        'Comprehensive breakdown of macroeconomic trends, quantitative valuation models, and equity research. This analysis explores historical valuation spreads across technology and industrial sectors.',
        'c5555555-5555-5555-5555-555555555555',
        'PUBLISHED',
        'Financial Analysis and Market Intelligence',
        'Meta description excerpt tit amet, consectetur adipiscing elit. Restams store promotion and convenience hosts to export a notta line more.',
        1200,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        '12345678-51a2-43f7-9abc-1234567890cd',
        'COMMUNITY',
        'Financial Analysis Pulls & Market Intelligence',
        'financial-analysis-pulls-market-intelligence',
        'Deep dive into market structure, liquidity flows, and quantitative equity valuation strategies across high-beta segments.',
        'c3333333-3333-3333-3333-333333333333',
        'PUBLISHED',
        'Financial Analysis Pulls & Market Intelligence',
        'Meta description excerpt tit amet, consectetur adipiscing elit. Restams store promotion and convenience hosts to export a notta line more.',
        30000,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        'a3333333-3333-3333-3333-333333333333',
        '55556666-51a2-43f7-9abc-1234567890ef',
        'COMMUNITY',
        'Fixed Income Multiples & Monetary Policy Shift',
        'fixed-income-multiples-monetary-policy-shift',
        'Comprehensive breakdown of historical treasury yield curve dynamics and central bank liquidity operations.',
        'c1111111-1111-1111-1111-111111111111',
        'PUBLISHED',
        'Fixed Income Multiples & Monetary Policy Shift',
        'Analyzing corporate debt spreads, duration sensitivity, and yield curve inversion indicators.',
        4500,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    )
ON CONFLICT (id) DO NOTHING;
