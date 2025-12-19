import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 모든 HTTPS 도메인 허용 (개발 단계)
      },
    ],
    formats: ['image/avif', 'image/webp'], // 최신 이미지 포맷 사용
  },

  // TurboPack 설정
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // webpack 설정
  webpack: (config) => {
    // @ts-expect-error 타입 에러 무시
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              typescript: true,
              ext: "tsx",
            },
          },
        ],
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
};

export default nextConfig;
