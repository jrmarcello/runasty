/**
 * Script para gerar ícones PWA em múltiplos tamanhos
 * Usa o ícone SVG como base
 */

import sharp from "sharp"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Tamanhos necessários para PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

// SVG base do ícone (mesmo do favicon)
const iconSvg = `<svg width="512" height="512" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  
  <!-- Rounded square background -->
  <rect width="32" height="32" rx="6" fill="url(#bgGradient)"/>
  
  <!-- Crown icon -->
  <g transform="translate(4, 5) scale(1)">
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" fill="white"/>
    <path d="M5 21h14" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`

async function generateIcons() {
  const iconsDir = path.join(__dirname, "../public/icons")

  // Criar diretório se não existir
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  console.log("🎨 Gerando ícones PWA...")

  for (const size of SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`)

    try {
      await sharp(Buffer.from(iconSvg))
        .resize(size, size)
        .png()
        .toFile(outputPath)

      console.log(`✅ Gerado: icon-${size}x${size}.png`)
    } catch (error) {
      console.error(`❌ Erro ao gerar icon-${size}x${size}.png:`, error)
    }
  }

  // Gerar também apple-touch-icon (180x180)
  const appleTouchPath = path.join(__dirname, "../public/apple-touch-icon.png")
  try {
    await sharp(Buffer.from(iconSvg))
      .resize(180, 180)
      .png()
      .toFile(appleTouchPath)

    console.log("✅ Gerado: apple-touch-icon.png (180x180)")
  } catch (error) {
    console.error("❌ Erro ao gerar apple-touch-icon.png:", error)
  }

  // Gerar favicon.ico (32x32)
  const faviconPath = path.join(__dirname, "../public/favicon.ico")
  try {
    await sharp(Buffer.from(iconSvg))
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace(".ico", ".png"))

    console.log("✅ Gerado: favicon.png (32x32)")
  } catch (error) {
    console.error("❌ Erro ao gerar favicon:", error)
  }

  console.log("\n🎉 Ícones PWA gerados com sucesso!")
}

generateIcons().catch(console.error)
