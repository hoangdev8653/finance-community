import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const routes = {
      '/login': '/dang-nhap', '/register': '/dang-ky', '/dashboard': '/bang-dieu-khien',
      '/bookmarks': '/bai-viet-da-luu', '/categories': '/danh-muc', '/contact': '/lien-he',
      '/learning': '/hoc-tap', '/learning-paths': '/lo-trinh-hoc', '/moderation': '/kiem-duyet',
      '/notifications': '/thong-bao', '/posts': '/bai-viet', '/privacy': '/chinh-sach-bao-mat',
      '/profile': '/ho-so', '/search': '/tim-kiem', '/chuoi-bai': '/series', '/tags': '/the',
      '/terms': '/dieu-khoan', '/tools': '/cong-cu', '/admin': '/quan-tri',
      '/learning/explore': '/series', '/hoc-tap/kham-pha': '/series',
      '/admin/audit-logs': '/quan-tri/nhat-ky-he-thong', '/admin/categories': '/quan-tri/danh-muc',
      '/admin/comments': '/quan-tri/binh-luan', '/admin/feature-flags': '/quan-tri/tinh-nang',
      '/admin/learning': '/quan-tri/hoc-tap', '/admin/moderation': '/quan-tri/kiem-duyet',
      '/admin/posts': '/quan-tri/bai-viet', '/admin/settings': '/quan-tri/cai-dat',
      '/admin/tags': '/quan-tri/the', '/admin/users': '/quan-tri/nguoi-dung',
    } as const;
    return [
      ...Object.entries(routes).map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: '/posts/:path*', destination: '/bai-viet/:path*', permanent: true },
      { source: '/chuoi-bai/:path*', destination: '/series/:path*', permanent: true },
      { source: '/tags/:path*', destination: '/the/:path*', permanent: true },
      { source: '/profile/:path*', destination: '/ho-so/:path*', permanent: true },
      { source: '/learning/:path*', destination: '/hoc-tap/:path*', permanent: true },
      { source: '/learning-paths/:path*', destination: '/lo-trinh-hoc/:path*', permanent: true },
      { source: '/admin/:path*', destination: '/quan-tri/:path*', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

