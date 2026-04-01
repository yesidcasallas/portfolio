import type { Route } from '../App'

interface Props {
  navigate: (to: Route) => void
}

export function Home({ navigate }: Props) {
  return (
    <>
      <header>
        <h1>Bienvenido</h1>
      </header>
      <main>
        <section aria-label="Introducción">
          <img
            src="/user.webp"
            alt="Fotografía profesional de Yesid Casallas, desarrollador FullStack"
            width="180"
            height="180"
            fetchPriority="high"
            decoding="async"
          />
          <h2>Hola, me llamo Yesid Casallas</h2>
          <p>
            Soy desarrollador <strong>FullStack</strong> con experiencia en tecnologías como React, Node.js y Next.js.
            Manejo bases de datos SQL y NoSQL, incluyendo MySQL, PostgreSQL y MongoDB.
            Además, cuento con conocimientos en DevOps utilizando herramientas como Docker.
          </p>
        </section>
        <section aria-labelledby="about-me-title">
          <h2 id="about-me-title">Sobre mí</h2>
          <p>
            Actualmente, estoy trabajando en un proyecto personal llamado <strong>MediHub</strong>,
            una plataforma multiplataforma diseñada para optimizar la gestión de medicamentos.
            Su objetivo principal es evitar que los usuarios pierdan tiempo en autorizaciones,
            permitiéndoles reservar los medicamentos de su orden en la sucursal más cercana.
          </p>
        </section>

        {/* Proyectos Destacados */}
        <section aria-labelledby="projects-title" className="projects-section">
          <h2 id="projects-title">Proyectos Destacados</h2>
          <div className="project-card lung-card">
            <div className="project-card-header">
              <div className="project-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                  <ellipse cx="20" cy="36" rx="12" ry="18" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7"/>
                  <ellipse cx="44" cy="36" rx="12" ry="18" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7"/>
                  <path d="M20 18 Q32 10 44 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <circle cx="38" cy="28" r="4" fill="currentColor" opacity="0.5"/>
                </svg>
              </div>
              <div className="project-badge">ML · IA Médica</div>
            </div>
            <h3>Detección de Cáncer de Pulmón</h3>
            <p>
              Modelo de clasificación de imágenes de TC entrenado con <strong>PyTorch</strong> y
              desplegado en el navegador vía <strong>ONNX Runtime</strong>.
              Clasifica imágenes en Normal, Benigno o Maligno con barras de confianza en tiempo real.
            </p>
            <div className="tech-stack">
              <span className="tech-tag">PyTorch</span>
              <span className="tech-tag">ONNX</span>
              <span className="tech-tag">CNN</span>
              <span className="tech-tag">React</span>
            </div>
            <div className="project-actions">
              <button
                id="btn-open-detector"
                className="btn-primary"
                onClick={() => navigate('detector')}
              >
                🫁 Ver Demo
              </button>
              <button
                id="btn-open-project"
                className="btn-secondary"
                onClick={() => navigate('project')}
              >
                📋 Más Info
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer role="contentinfo">
        <nav aria-label="Enlaces de contacto y redes sociales">
          <section aria-labelledby="contact-title">
            <h2 id="contact-title">Contacto</h2>
            <address>
              <ul>
                <li><a href="https://www.linkedin.com/in/yesidcasallas/" target="_blank" rel="noopener noreferrer">Linkedin</a></li>
                <li><a href="https://github.com/yesidcasallas/" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://x.com/yesidcasallasx" target="_blank" rel="noopener noreferrer">X</a></li>
              </ul>
            </address>
          </section>
        </nav>
        <section aria-labelledby="interests-title" role="complementary">
          <h2 id="interests-title">Me gusta</h2>
          <ul role="list">
            <li>Programar</li>
            <li>Aprender nuevas tecnologías</li>
            <li>Resolver problemas</li>
            <li>Colaborar en proyectos</li>
            <li>Explorar nuevas ideas</li>
          </ul>
        </section>
      </footer>
    </>
  )
}