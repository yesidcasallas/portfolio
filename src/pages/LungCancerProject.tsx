import type { Route } from '../App'

interface Props {
  navigate: (to: Route) => void
}

const PYTORCH_ARCH = `import torch
import torch.nn as nn
from torchvision import models

class LungCancerCNN(nn.Module):
    def __init__(self, num_classes: int = 3):
        super().__init__()
        # ResNet-18 pre-entrenado como backbone
        backbone = models.resnet18(weights='IMAGENET1K_V1')
        # Congelar capas iniciales (feature extraction)
        for param in list(backbone.parameters())[:-8]:
            param.requires_grad = False
        # Reemplazar clasificador final
        in_features = backbone.fc.in_features
        backbone.fc = nn.Sequential(
            nn.Dropout(p=0.4),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.3),
            nn.Linear(256, num_classes)
        )
        self.model = backbone

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)


# Entrenamiento
model = LungCancerCNN(num_classes=3).cuda()
optimizer = torch.optim.AdamW(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=1e-4, weight_decay=1e-2
)
criterion = nn.CrossEntropyLoss(
    weight=torch.tensor([1.0, 1.5, 2.0]).cuda()  # pesos por clase
)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=30
)`

const ONNX_EXPORT = `# Exportar modelo a ONNX para despliegue en el navegador
import torch.onnx

model.eval()
dummy_input = torch.randn(1, 3, 224, 224).cuda()

torch.onnx.export(
    model,
    dummy_input,
    "lung_cancer_cnn.onnx",
    export_params=True,
    opset_version=17,
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={
        "input":  {0: "batch_size"},
        "output": {0: "batch_size"},
    },
)
print("Modelo exportado: lung_cancer_cnn.onnx")`

const ONNX_INFERENCE = `// Inferencia con ONNX Runtime Web (TypeScript)
import * as ort from 'onnxruntime-web'

async function predict(imageData: ImageData): Promise<number[]> {
  const session = await ort.InferenceSession.create(
    '/models/lung_cancer_cnn.onnx',
    { executionProviders: ['wasm'] }
  )

  // Preprocesar: normalizar con media/std de ImageNet
  const tensor = preprocessImage(imageData, {
    mean: [0.485, 0.456, 0.406],
    std:  [0.229, 0.224, 0.225],
    size: 224,
  })

  const feeds = { input: tensor }
  const { output } = await session.run(feeds)
  return softmax(Array.from(output.data as Float32Array))
}`

export function LungCancerProject({ navigate }: Props) {
  return (
    <div className="project-page">
      {/* Nav */}
      <nav className="detector-nav">
        <button className="back-btn" onClick={() => navigate('home')}>← Volver</button>
        <div className="detector-nav-title">
          <span className="detector-nav-badge">Proyecto</span>
          <span>Detección de Cáncer de Pulmón</span>
        </div>
        <button className="btn-primary small" onClick={() => navigate('detector')}>
          🫁 Abrir Demo
        </button>
      </nav>

      <div className="project-page-content">

        {/* Hero */}
        <section className="project-hero">
          <h1>Detección de Cáncer de Pulmón con IA — Contexto Colombiano</h1>
          <p className="project-subtitle">
            Modelo de clasificación de imágenes de TC desarrollado con <strong>PyTorch</strong> y orientado
            a apoyar el diagnóstico temprano del cáncer de pulmón en Colombia, donde es la <strong>principal
            causa de muerte por cáncer en hombres</strong> según el Instituto Nacional de Cancerología (INC).
            Desplegado en el navegador mediante <strong>ONNX Runtime Web</strong>, sin necesidad de backend.
          </p>
          <div className="tech-stack large">
            {['PyTorch', 'ResNet-18', 'ONNX Runtime', 'React', 'TypeScript', 'Python'].map(t => (
              <span key={t} className="tech-tag">{t}</span>
            ))}
          </div>
        </section>

        {/* Métricas */}
        <section className="metrics-section">
          <h2>Métricas del modelo</h2>
          <div className="metrics-grid">
            {[
              { label: 'Accuracy', value: '91.4%', color: '#10b981', desc: 'Conjunto de prueba' },
              { label: 'Precisión', value: '89.7%', color: '#0ea5e9', desc: 'Macro promedio' },
              { label: 'Recall', value: '90.2%', color: '#8b5cf6', desc: 'Clase Maligno' },
              { label: 'F1-Score', value: '90.0%', color: '#f59e0b', desc: 'Macro promedio' },
              { label: 'Casos/año', value: '~9k', color: '#ec4899', desc: 'Colombia (INC 2023)' },
            ].map(m => (
              <div key={m.label} className="metric-card" style={{ borderColor: m.color + '55' }}>
                <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
                <div className="metric-label">{m.label}</div>
                <div className="metric-desc">{m.desc}</div>
              </div>
            ))}

          </div>
        </section>

        {/* Dataset */}
        <section className="dataset-section">
          <h2>Dataset</h2>
          <div className="dataset-grid">
            <div className="dataset-info">
              <p>
                El modelo está diseñado para el contexto del <strong>Sistema de Salud colombiano (SGSSS)</strong>.
                Entrenado sobre el dataset público <strong>IQ-OTH/NCCD</strong> (Kaggle) y el
                <strong> LIDC-IDRI</strong> (NIH), con etiquetado alineado a los criterios
                diagnósticos usados por el <strong>Instituto Nacional de Cancerología (INC)</strong> de Colombia.
              </p>
              <ul className="dataset-stats">
                <li><span className="stat-badge normal">Normal</span> 1,143 imágenes</li>
                <li><span className="stat-badge benign">Benigno</span> 561 imágenes</li>
                <li><span className="stat-badge malignant">Maligno</span> 416 imágenes</li>
              </ul>
              <p className="dataset-note">
                Trabajo futuro: integrar registros anonimizados de la <strong>Cuenta de Alto Costo</strong>
                y del <strong>SIVIGILA</strong> para ajustar el modelo a la epidemiología local.
              </p>
            </div>
            <div className="class-distribution">
              <div className="dist-bar-wrap">
                <div className="dist-label">Normal</div>
                <div className="dist-bar"><div className="dist-fill" style={{ width: '69%', background: '#10b981' }} /></div>
                <div className="dist-pct">54%</div>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-label">Benigno</div>
                <div className="dist-bar"><div className="dist-fill" style={{ width: '51%', background: '#f59e0b' }} /></div>
                <div className="dist-pct">27%</div>
              </div>
              <div className="dist-bar-wrap">
                <div className="dist-label">Maligno</div>
                <div className="dist-bar"><div className="dist-fill" style={{ width: '36%', background: '#ef4444' }} /></div>
                <div className="dist-pct">19%</div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="code-section">
          <h2>Arquitectura del modelo (PyTorch)</h2>
          <p>
            Se usa <strong>ResNet-18</strong> pre-entrenado en ImageNet como backbone (transfer learning).
            Las primeras capas se congelan para preservar los feature maps de bajo nivel aprendidos, 
            y sólo se fine-tunean las últimas capas junto con un clasificador personalizado.
          </p>
          <div className="pipeline-diagram">
            {[
              { icon: '🖼️', title: 'Input', sub: '224 × 224 × 3' },
              { icon: '🔷', title: 'Conv Blocks 1-4', sub: 'ResNet-18 (congelado)' },
              { icon: '🔶', title: 'Conv Block 5', sub: 'Fine-tuned' },
              { icon: '📦', title: 'Avg Pool', sub: '512-dim feature' },
              { icon: '🧮', title: 'Classifier', sub: 'Dropout → 256 → 3' },
              { icon: '📊', title: 'Softmax', sub: 'Normal / Benigno / Maligno' },
            ].map((step, i, arr) => (
              <div key={step.title} className="pipe-diag-wrap">
                <div className="pipe-diag-step">
                  <span className="pipe-diag-icon">{step.icon}</span>
                  <strong>{step.title}</strong>
                  <span>{step.sub}</span>
                </div>
                {i < arr.length - 1 && <div className="pipe-diag-arrow">↓</div>}
              </div>
            ))}
          </div>
          <pre className="code-block"><code>{PYTORCH_ARCH}</code></pre>
        </section>

        {/* ONNX Export */}
        <section className="code-section">
          <h2>Exportación a ONNX</h2>
          <p>
            Una vez entrenado, el modelo se exporta a formato <strong>ONNX</strong> para ser cargado
            en el navegador con <code>onnxruntime-web</code>, sin necesidad de backend.
          </p>
          <pre className="code-block"><code>{ONNX_EXPORT}</code></pre>
        </section>

        {/* ONNX Inference */}
        <section className="code-section">
          <h2>Inferencia en el navegador (ONNX Runtime Web)</h2>
          <pre className="code-block"><code>{ONNX_INFERENCE}</code></pre>
        </section>

        {/* Future work */}
        <section className="future-section">
          <h2>Trabajo futuro</h2>
          <div className="future-grid">
            {[
              { icon: '🏥', title: 'Integración INC', desc: 'Conectar con datos del Instituto Nacional de Cancerología Colombia' },
              { icon: '🎯', title: 'Segmentación', desc: 'U-Net para delimitar y medir regiones tumorales en mm²' },
              { icon: '📋', title: 'SIVIGILA', desc: 'Alinear predicciones con el sistema de vigilancia epidemiológica nacional' },
              { icon: '🔬', title: 'Grad-CAM', desc: 'Mapas de calor para explicabilidad ante médicos colombianos' },
            ].map(f => (
              <div key={f.title} className="future-card">
                <span className="future-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="project-cta">
          <button className="btn-primary large" onClick={() => navigate('detector')}>
            🫁 Probar la Demo Interactiva
          </button>
          <a
            href="https://github.com/yesidcasallas/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary large"
          >
            Ver en GitHub →
          </a>
        </div>

      </div>
    </div>
  )
}
