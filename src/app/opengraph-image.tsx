/**
 * Open Graph Image - Gerada dinamicamente
 * 
 * Imagem de 1200x630 para compartilhamento em redes sociais
 */

import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Runasty - Ranking Competitivo de Corrida com Strava"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1f2937 0%, #111827 50%)",
        }}
      >
        {/* Logo - Coroa com gradiente laranja */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 28,
            background: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
            marginBottom: 40,
            boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)",
          }}
        >
          {/* Crown SVG */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
            <path d="M5 21h14" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          <span style={{ color: "#f97316" }}>Run</span>
          <span style={{ color: "white" }}>asty</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#9ca3af",
            marginBottom: 40,
          }}
        >
          Ranking Competitivo de Corrida
        </div>

        {/* Distances */}
        <div
          style={{
            display: "flex",
            gap: 40,
          }}
        >
          {["5K", "10K", "21K"].map((distance) => (
            <div
              key={distance}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 40px",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
                borderRadius: 16,
                border: "2px solid #f97316",
              }}
            >
              <span style={{ fontSize: 36, fontWeight: 700, color: "#f97316" }}>
                {distance}
              </span>
            </div>
          ))}
        </div>

        {/* Slogan */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#6b7280",
            marginTop: 50,
            fontStyle: "italic",
          }}
        >
          Conquiste a coroa e defenda sua dinastia!
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
