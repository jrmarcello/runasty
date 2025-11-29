/**
 * Open Graph Image - Gerada dinamicamente
 * 
 * Imagem de 1200x630 para compartilhamento em redes sociais
 */

import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Runasty - Ranking de Corrida"
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
        {/* Logo/Emoji */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 120 }}>🏃‍♂️</span>
          <span style={{ fontSize: 100, marginLeft: 20 }}>👑</span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            background: "linear-gradient(to right, #f97316, #fb923c)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
          }}
        >
          Runasty
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
