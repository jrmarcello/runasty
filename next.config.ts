import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Headers de segurança
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "dgalywyr863hv.cloudfront.net", // Strava avatars
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplicar a todas as rotas
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// Configuração do Sentry (só aplica se DSN estiver configurado)
const sentryConfig = {
  // Silencia logs do Sentry durante build
  silent: true,
  // Organização e projeto no Sentry (configurar depois)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Upload de source maps apenas em produção
  hideSourceMaps: true,
  // Desabilita telemetria do Sentry
  disableLogger: true,
};

// Só envolve com Sentry se o DSN estiver configurado
const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;

export default finalConfig;
