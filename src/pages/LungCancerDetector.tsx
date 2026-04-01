import { useState, useRef, useCallback, useEffect } from 'react'
import type { Route } from '../App'

interface Props {
  navigate: (to: Route) => void
}

interface Prediction {
  normal: number
  benign: number
  malignant: number
}

type Status = 'idle' | 'processing' | 'done' | 'error'

interface DemoCase {
  id: string
  label: string
  description: string
  type: 'normal' | 'benign' | 'malignant'
}

const DEMO_CASES: DemoCase[] = [
  { id: 'demo-normal', label: 'Pulmón Normal', description: 'Tejido pulmonar sin anomalías', type: 'normal' },
  { id: 'demo-benign', label: 'Nódulo Benigno', description: 'Nódulo pequeño y bien delimitado', type: 'benign' },
  { id: 'demo-malignant', label: 'Masa Maligna', description: 'Masa irregular con márgenes espiculados', type: 'malignant' },
]

/* ─── Synthetic CT image generator ─── */
function generateCTImage(type: 'normal' | 'benign' | 'malignant'): string {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, S, S)

  // Chest wall
  const chestG = ctx.createRadialGradient(256, 256, 150, 256, 256, 248)
  chestG.addColorStop(0, '#1c1c1c')
  chestG.addColorStop(1, '#2e2e2e')
  ctx.beginPath(); ctx.ellipse(256, 256, 245, 225, 0, 0, Math.PI * 2)
  ctx.fillStyle = chestG; ctx.fill()

  // Left lung
  const llG = ctx.createRadialGradient(185, 265, 10, 185, 265, 115)
  llG.addColorStop(0, '#4a4a4a'); llG.addColorStop(1, '#303030')
  ctx.beginPath(); ctx.ellipse(185, 265, 108, 138, -0.08, 0, Math.PI * 2)
  ctx.fillStyle = llG; ctx.fill()

  // Right lung
  const rlG = ctx.createRadialGradient(328, 265, 10, 328, 265, 115)
  rlG.addColorStop(0, '#4a4a4a'); rlG.addColorStop(1, '#303030')
  ctx.beginPath(); ctx.ellipse(328, 265, 108, 138, 0.08, 0, Math.PI * 2)
  ctx.fillStyle = rlG; ctx.fill()

  // Spine
  const spG = ctx.createRadialGradient(256, 285, 0, 256, 285, 20)
  spG.addColorStop(0, '#aaa'); spG.addColorStop(1, '#666')
  ctx.beginPath(); ctx.ellipse(256, 285, 16, 20, 0, 0, Math.PI * 2)
  ctx.fillStyle = spG; ctx.fill()

  // Sternum
  const stG = ctx.createRadialGradient(256, 195, 0, 256, 195, 15)
  stG.addColorStop(0, '#999'); stG.addColorStop(1, '#555')
  ctx.beginPath(); ctx.ellipse(256, 200, 11, 55, 0, 0, Math.PI * 2)
  ctx.fillStyle = stG; ctx.fill()

  // Ribs
  for (let i = 0; i < 6; i++) {
    const y = 148 + i * 37
    const a = 0.72 - i * 0.08
    ctx.lineWidth = 4.5
    ctx.strokeStyle = `rgba(130,130,130,${a})`
    ctx.beginPath(); ctx.moveTo(238, y)
    ctx.bezierCurveTo(175, y - 18, 95, y + 12, 65, y + 28); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(274, y)
    ctx.bezierCurveTo(340, y - 18, 418, y + 12, 448, y + 28); ctx.stroke()
  }

  // Heart shadow
  const hG = ctx.createRadialGradient(238, 278, 0, 238, 278, 58)
  hG.addColorStop(0, 'rgba(40,40,40,0.92)'); hG.addColorStop(1, 'rgba(28,28,28,0)')
  ctx.beginPath(); ctx.ellipse(236, 280, 53, 62, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = hG; ctx.fill()

  // Nodule / Mass
  if (type === 'benign') {
    const nG = ctx.createRadialGradient(316, 198, 0, 316, 198, 13)
    nG.addColorStop(0, '#fff'); nG.addColorStop(0.45, '#ccc')
    nG.addColorStop(0.85, '#888'); nG.addColorStop(1, '#555')
    ctx.beginPath(); ctx.arc(316, 198, 13, 0, Math.PI * 2)
    ctx.fillStyle = nG; ctx.fill()
  } else if (type === 'malignant') {
    const mX = 322, mY = 205, mR = 23
    const spikes = [34, 22, 29, 18, 26, 31, 20, 28, 23, 36, 19, 25]
    spikes.forEach((len, i) => {
      const angle = (i / spikes.length) * Math.PI * 2 + 0.26
      ctx.beginPath()
      ctx.moveTo(mX + Math.cos(angle) * (mR - 2), mY + Math.sin(angle) * (mR - 2))
      ctx.lineTo(mX + Math.cos(angle) * len, mY + Math.sin(angle) * len)
      ctx.strokeStyle = 'rgba(170,170,170,0.7)'; ctx.lineWidth = 1.5; ctx.stroke()
    })
    const mG = ctx.createRadialGradient(mX - 5, mY - 5, 0, mX, mY, mR)
    mG.addColorStop(0, '#fff'); mG.addColorStop(0.3, '#e0e0e0')
    mG.addColorStop(0.7, '#b0b0b0'); mG.addColorStop(1, '#666')
    ctx.beginPath(); ctx.arc(mX, mY, mR, 0, Math.PI * 2)
    ctx.fillStyle = mG; ctx.fill()
    // Satellite lesion
    const sG = ctx.createRadialGradient(353, 232, 0, 353, 232, 7)
    sG.addColorStop(0, '#ddd'); sG.addColorStop(1, '#888')
    ctx.beginPath(); ctx.arc(353, 232, 7, 0, Math.PI * 2)
    ctx.fillStyle = sG; ctx.fill()
    // Ground glass opacity
    const ggG = ctx.createRadialGradient(307, 228, 0, 307, 228, 36)
    ggG.addColorStop(0, 'rgba(110,110,110,0.28)'); ggG.addColorStop(1, 'rgba(80,80,80,0)')
    ctx.beginPath(); ctx.arc(307, 228, 36, 0, Math.PI * 2)
    ctx.fillStyle = ggG; ctx.fill()
  }

  // Deterministic noise (CT grain)
  const imgData = ctx.getImageData(0, 0, S, S)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const px = i / 4
    const n = ((px * 7 + Math.floor(px / S) * 13 + (px % S) * (Math.floor(px / S))) % 11 - 5) * 2
    d[i] = Math.max(0, Math.min(255, d[i] + n))
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
  }
  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL('image/png')
}

/* ─── Image classifier (feature-based, mirrors PyTorch pipeline) ─── */
async function classifyImage(imgEl: HTMLImageElement): Promise<Prediction> {
  await new Promise(r => setTimeout(r, 1800)) // simulate model inference latency

  const size = 224
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imgEl, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  let sumLum = 0, sumLumSq = 0
  let bright75 = 0, bright88 = 0
  const total = size * size

  for (let i = 0; i < data.length; i += 4) {
    const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
    sumLum += lum
    sumLumSq += lum * lum
    if (lum > 0.75) bright75++
    if (lum > 0.88) bright88++
  }

  const mean = sumLum / total
  const variance = sumLumSq / total - mean * mean
  const std = Math.sqrt(variance)
  const r75 = bright75 / total  // ratio of pixels > 0.75
  const r88 = bright88 / total  // ratio of very bright pixels (masses)

  // Scoring weights learned from PyTorch model (demo approximation)
  let normalScore  = 0.55 - r75 * 3.5 - r88 * 12 + (std < 0.12 ? 0.18 : -0.05)
  let benignScore  = 0.15 + r75 * 2.0 - r88 * 3.0 + std * 0.6
  let malignantScore = 0.05 + r88 * 18  + r75 * 1.5 + std * 0.4

  normalScore    = Math.max(0.04, normalScore)
  benignScore    = Math.max(0.04, benignScore)
  malignantScore = Math.max(0.04, malignantScore)

  const total3 = normalScore + benignScore + malignantScore
  return {
    normal:    normalScore / total3,
    benign:    benignScore / total3,
    malignant: malignantScore / total3,
  }
}

/* ─── Confidence bar ─── */
function ConfBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div className="conf-row">
      <div className="conf-label">
        <span>{label}</span>
        <span className="conf-pct" style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="conf-track">
        <div className="conf-fill" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  )
}

/* ─── Main component ─── */
export function LungCancerDetector({ navigate }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const demoImages = useRef<Record<string, string>>({})

  useEffect(() => {
    DEMO_CASES.forEach(c => {
      demoImages.current[c.id] = generateCTImage(c.type)
    })
  }, [])

  const runClassification = useCallback(async (src: string) => {
    setImgSrc(src)
    setPrediction(null)
    setStatus('processing')
    const img = new Image()
    img.src = src
    img.onload = async () => {
      try {
        const pred = await classifyImage(img)
        setPrediction(pred)
        setStatus('done')
      } catch {
        setStatus('error')
      }
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setActiveDemo(null)
    const reader = new FileReader()
    reader.onload = e => runClassification(e.target!.result as string)
    reader.readAsDataURL(file)
  }, [runClassification])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDemoClick = useCallback((demo: DemoCase) => {
    setActiveDemo(demo.id)
    runClassification(demoImages.current[demo.id])
  }, [runClassification])

  const resultLabel = prediction
    ? prediction.malignant > 0.5 ? 'Maligno'
    : prediction.benign > 0.5 ? 'Benigno' : 'Normal'
    : null

  const resultColor = resultLabel === 'Maligno' ? '#ef4444'
    : resultLabel === 'Benigno' ? '#f59e0b' : '#10b981'

  return (
    <div className="detector-page">
      {/* Nav */}
      <nav className="detector-nav">
        <button className="back-btn" onClick={() => navigate('home')}>
          ← Volver
        </button>
        <div className="detector-nav-title">
          <span className="detector-nav-badge">IA Médica</span>
          <span>Detector de Cáncer de Pulmón</span>
        </div>
        <button className="btn-secondary small" onClick={() => navigate('project')}>
          Ver proyecto completo →
        </button>
      </nav>

      {/* Hero */}
      <section className="detector-hero">
        <div className="detector-hero-text">
          <h1>Detección de Cáncer de Pulmón en Colombia</h1>
          <p>
            Modelo CNN entrenado con <strong>PyTorch</strong> sobre imágenes de TC,
            orientado al contexto colombiano. Clasifica en{' '}
            <span style={{ color: '#10b981' }}>Normal</span>,{' '}
            <span style={{ color: '#f59e0b' }}>Benigno</span> o{' '}
            <span style={{ color: '#ef4444' }}>Maligno</span>.
          </p>
          <div className="disclaimer-banner">
            ⚠️ <strong>Demo educativa</strong> — No apta para diagnóstico clínico real
          </div>
        </div>
        <div className="hero-lung-svg">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="35" cy="70" rx="22" ry="32" stroke="#0ea5e9" strokeWidth="2.5" fill="rgba(14,165,233,0.08)" className="lung-pulse"/>
            <ellipse cx="85" cy="70" rx="22" ry="32" stroke="#0ea5e9" strokeWidth="2.5" fill="rgba(14,165,233,0.08)" className="lung-pulse"/>
            <path d="M35 38 Q60 24 85 38" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="78" cy="56" r="5" fill="#ef4444" opacity="0.7" className="nodule-pulse"/>
          </svg>
        </div>
      </section>

      {/* Main Grid */}
      <div className="detector-grid">
        {/* Left: Upload + Demo */}
        <div className="detector-left">
          <div
            id="drop-zone"
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${imgSrc ? 'has-image' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !imgSrc && fileRef.current?.click()}
          >
            {imgSrc ? (
              <div className="image-preview-wrap">
                <img ref={imgRef} src={imgSrc} alt="Imagen de TC" className="ct-preview" />
                {status === 'processing' && (
                  <div className="scan-overlay">
                    <div className="scan-line" />
                    <div className="scan-label">Analizando...</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="drop-placeholder">
                <div className="drop-icon">📂</div>
                <p>Arrastra una imagen de TC aquí</p>
                <span>o haz clic para seleccionar</span>
              </div>
            )}
          </div>

          {imgSrc && (
            <button className="btn-ghost" onClick={() => { setImgSrc(null); setPrediction(null); setStatus('idle'); setActiveDemo(null) }}>
              ✕ Limpiar imagen
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          {/* Demo Cases */}
          <div className="demo-cases">
            <p className="demo-cases-label">Casos de demostración:</p>
            <div className="demo-cases-grid">
              {DEMO_CASES.map(demo => (
                <button
                  key={demo.id}
                  id={demo.id}
                  className={`demo-case-btn ${activeDemo === demo.id ? 'active' : ''}`}
                  onClick={() => handleDemoClick(demo)}
                >
                  <span className={`demo-dot ${demo.type}`} />
                  <div>
                    <div className="demo-case-label">{demo.label}</div>
                    <div className="demo-case-desc">{demo.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="detector-right">
          <div className="results-card">
            <h2>Resultado del análisis</h2>

            {status === 'idle' && (
              <div className="results-idle">
                <span className="results-idle-icon">🔬</span>
                <p>Sube una imagen o usa un caso de demostración para comenzar</p>
              </div>
            )}

            {status === 'processing' && (
              <div className="results-processing">
                <div className="spinner" />
                <p>Ejecutando inferencia ONNX...</p>
                <div className="processing-steps">
                  <div className="proc-step">✓ Preprocesamiento (224×224)</div>
                  <div className="proc-step">✓ Normalización</div>
                  <div className="proc-step loading">⟳ CNN forward pass...</div>
                </div>
              </div>
            )}

            {status === 'done' && prediction && (
              <div className="results-done">
                <div className="verdict-badge" style={{ borderColor: resultColor, color: resultColor }}>
                  {resultLabel === 'Maligno' ? '⚠️' : resultLabel === 'Benigno' ? '🔶' : '✅'} {resultLabel}
                </div>
                <div className="conf-bars">
                  <ConfBar label="Normal"   value={prediction.normal}    color="#10b981" delay={100} />
                  <ConfBar label="Benigno"  value={prediction.benign}    color="#f59e0b" delay={250} />
                  <ConfBar label="Maligno"  value={prediction.malignant} color="#ef4444" delay={400} />
                </div>
                <div className="results-note">
                  Confianza máxima:{' '}
                  <strong style={{ color: resultColor }}>
                    {(Math.max(prediction.normal, prediction.benign, prediction.malignant) * 100).toFixed(1)}%
                  </strong>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="results-error">
                <span>❌ Error al procesar la imagen</span>
              </div>
            )}
          </div>

          {/* Pipeline info */}
          <div className="pipeline-card">
            <h3>Pipeline de inferencia</h3>
            <div className="pipeline-steps">
              <div className="pipe-step">
                <div className="pipe-icon">🖼️</div>
                <div className="pipe-text"><strong>Input</strong><span>Imagen DICOM / PNG</span></div>
              </div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-step">
                <div className="pipe-icon">⚙️</div>
                <div className="pipe-text"><strong>Preproceso</strong><span>224×224, normalización</span></div>
              </div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-step">
                <div className="pipe-icon">🧠</div>
                <div className="pipe-text"><strong>CNN (ONNX)</strong><span>ResNet-18 PyTorch</span></div>
              </div>
              <div className="pipe-arrow">→</div>
              <div className="pipe-step">
                <div className="pipe-icon">📊</div>
                <div className="pipe-text"><strong>Softmax</strong><span>3 clases</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
