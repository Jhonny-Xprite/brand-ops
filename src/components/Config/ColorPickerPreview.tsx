import { useEffect, useRef } from 'react'

export interface ColorPickerPreviewProps {
  primaryColor: string
  secondaryColor: string
}

/**
 * ColorPickerPreview Component
 * Renders a canvas-based color preview showing primary and secondary colors
 * AC#2: Preview de Cores — Mostrar uma pequena amostra visual ao lado do código HEX
 */
export const ColorPickerPreview = ({ primaryColor, secondaryColor }: ColorPickerPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#1f2937' // gray-800
    ctx.fillRect(0, 0, width, height)

    // Draw primary color (left half)
    ctx.fillStyle = primaryColor
    ctx.fillRect(0, 0, width / 2, height)

    // Draw secondary color (right half)
    ctx.fillStyle = secondaryColor
    ctx.fillRect(width / 2, 0, width / 2, height)

    // Draw border
    ctx.strokeStyle = '#374151' // gray-700
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, width, height)
  }, [primaryColor, secondaryColor])

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400">Pré-visualização</p>
      <canvas
        ref={canvasRef}
        width={200}
        height={80}
        className="border border-gray-700 rounded-lg"
      />
      <div className="flex gap-4 text-xs text-gray-400">
        <div>
          <p>Primária</p>
          <p className="font-mono text-gray-300">{primaryColor}</p>
        </div>
        <div>
          <p>Secundária</p>
          <p className="font-mono text-gray-300">{secondaryColor}</p>
        </div>
      </div>
    </div>
  )
}

export default ColorPickerPreview
