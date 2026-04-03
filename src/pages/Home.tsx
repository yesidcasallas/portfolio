import { useState, useEffect, useRef } from 'react'
import type { Theme } from '../App'

/* ================================================================
   INTERSECTION OBSERVER HOOK
================================================================ */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

/* ================================================================
   REVEAL WRAPPER — scroll-triggered fade/slide
================================================================ */
function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none' | 'scale'
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={`reveal reveal--${direction} ${inView ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ================================================================
   TYPES
================================================================ */
interface Props {
  theme: Theme
  toggleTheme: () => void
}

/* ================================================================
   NAVIGATION
================================================================ */
function Nav({
  theme,
  toggleTheme,
  scrolled,
  scrollTo,
}: {
  theme: Theme
  toggleTheme: () => void
  scrolled: boolean
  scrollTo: (id: string) => void
}) {
  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} role="navigation" aria-label="Navegación principal">
      <div className="nav__inner">
        <button className="nav__logo" onClick={() => scrollTo('hero')} aria-label="Ir al inicio">
          <span className="nav__logo-text">YC</span>
        </button>

        <ul className="nav__links">
          <li><button className="nav__link" onClick={() => scrollTo('about')}>Sobre mí</button></li>
          <li><button className="nav__link" onClick={() => scrollTo('projects')}>Proyectos</button></li>
          <li><button className="nav__link" onClick={() => scrollTo('contact')}>Contacto</button></li>
        </ul>

        <div className="nav__actions">
          <a
            href="https://github.com/yesidcasallas/"
            className="nav__github"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver perfil de GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub</span>
          </a>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            <span className="theme-toggle__track">
              <span className="theme-toggle__thumb" aria-hidden="true">
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ================================================================
   HERO
================================================================ */
function Hero({ scrollTo }: { scrollTo: (id: string) => void }) {
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="hero" className="hero" aria-label="Presentación">
      {/* Atmospheric background */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__dots" />
        <div className="hero__orb-1" />
        <div className="hero__orb-2" />
      </div>

      <div className="hero__content">
        {/* Eyebrow */}
        <p className={`hero__eyebrow${vis ? ' visible' : ''}`}>
          <span className="hero__dot" aria-hidden="true" />
          Desarrollador FullStack · Bogotá, Colombia
        </p>

        {/* Name */}
        <h1 className={`hero__name${vis ? ' visible' : ''}`} aria-label="Yesid Casallas">
          <span className="hero__name-row">Yesid</span>
          <span className="hero__name-row hero__name-row--accent">Casallas</span>
        </h1>

        {/* Tagline */}
        <p className={`hero__tagline${vis ? ' visible' : ''}`}>
          Construyo productos digitales <strong>con propósito</strong>,<br />
          desde el frontend hasta la infraestructura.
        </p>

        {/* CTAs */}
        <div className={`hero__cta${vis ? ' visible' : ''}`}>
          <button className="btn btn--solid" onClick={() => scrollTo('projects')}>
            Ver proyectos
            <span className="btn__icon" aria-hidden="true">→</span>
          </button>
          <button className="btn btn--outline" onClick={() => scrollTo('contact')}>
            Contacto
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        className={`hero__scroll${vis ? ' visible' : ''}`}
        onClick={() => scrollTo('about')}
        aria-label="Desplazar hacia abajo"
      >
        <span className="hero__scroll-line" aria-hidden="true" />
        <span>Scroll</span>
      </button>
    </section>
  )
}

/* ================================================================
   ABOUT
================================================================ */
const SKILLS = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'CSS'] },
  { category: 'Backend',  items: ['Node.js', 'Express', 'REST APIs', 'GraphQL'] },
  { category: 'Datos',    items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'] },
  { category: 'DevOps',   items: ['Docker', 'Git', 'Linux', 'CI/CD'] },
]

function About() {
  return (
    <section id="about" className="about section" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">

          {/* Photo */}
          <Reveal direction="left" className="about__photo-wrap">
            <div className="about__photo-frame">
              <img
                src="/user.webp"
                alt="Yesid Casallas — Desarrollador FullStack"
                className="about__photo"
                width={380}
                height={380}
                loading="lazy"
                decoding="async"
              />
              <div className="about__ring"   aria-hidden="true" />
              <div className="about__corner" aria-hidden="true" />
              <div className="about__badge">
                <span className="about__badge-dot" aria-hidden="true" />
                Disponible
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div className="about__text">
            <Reveal delay={80}>
              <span className="label">Sobre mí</span>
            </Reveal>

            <Reveal delay={160}>
              <h2 id="about-title" className="section-title">
                Código limpio,<br />
                <span className="text-accent">resultados reales</span>
              </h2>
            </Reveal>

            <Reveal delay={240}>
              <p className="about__bio">
                Soy un desarrollador <strong>FullStack</strong> apasionado por construir soluciones
                que resuelven problemas reales. Me especializo en crear aplicaciones web escalables
                con experiencias de usuario excepcionales, desde el diseño hasta el deployment.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <p className="about__bio">
                Actualmente trabajo en <strong>MediHub</strong>, una plataforma multiplataforma
                para la gestión de medicamentos que busca agilizar reservas y eliminar demoras
                en autorizaciones médicas dentro del sistema de salud colombiano.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="skills" aria-label="Habilidades técnicas">
                {SKILLS.map(group => (
                  <div key={group.category} className="skill-row">
                    <span className="skill-category">{group.category}</span>
                    <div className="skill-tags">
                      {group.items.map(s => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ================================================================
   PROJECTS
================================================================ */
const PROJECTS = [
  {
    id: 'medihub',
    icon: '🏥',
    bar: 'linear-gradient(90deg, #64ffd4, #00c46a)',
    badge: 'En desarrollo',
    badgeClass: 'badge-green',
    title: 'MediHub',
    sub: 'Plataforma médica · Fullstack',
    desc: 'Sistema integral para la gestión de medicamentos que agiliza reservas y elimina demoras en autorizaciones médicas dentro del sistema de salud colombiano (SGSSS).',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'TypeScript'],
  },
  {
    id: 'lungai',
    icon: '🫁',
    bar: 'linear-gradient(90deg, #ff6464, #ff9f6b)',
    badge: '91.4% precisión',
    badgeClass: 'badge-red',
    title: 'Detección IA',
    sub: 'Cáncer de pulmón · ML',
    desc: 'Modelo CNN entrenado con imágenes CT para clasificar tejido pulmonar como Normal, Benigno o Maligno. Inferencia 100% en el navegador mediante ONNX Runtime Web.',
    tech: ['PyTorch', 'ONNX Runtime', 'ResNet-18', 'React', 'TypeScript', 'Python'],
  },
]

function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <div className="projects__header">
          <Reveal>
            <span className="label">Proyectos</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 id="projects-title" className="section-title">
              Lo que<br />
              <span className="text-accent">he construido</span>
            </h2>
          </Reveal>
        </div>

        <div className="projects__grid">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 140} direction="up">
              <article className="project-card" aria-label={p.title}>
                {/* Color bar */}
                <div
                  className="project-card__bar"
                  style={{ background: p.bar }}
                  aria-hidden="true"
                />
                {/* Header */}
                <div className="project-card__head">
                  <span className="project-card__icon" role="img" aria-hidden="true">
                    {p.icon}
                  </span>
                  <span className={`project-card__badge ${p.badgeClass}`}>{p.badge}</span>
                </div>
                {/* Body */}
                <div className="project-card__body">
                  <h3 className="project-card__title">{p.title}</h3>
                  <p className="project-card__sub">{p.sub}</p>
                  <p className="project-card__desc">{p.desc}</p>
                </div>
                {/* Footer */}
                <div className="project-card__foot">
                  {p.tech.map(t => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   CONTACT
================================================================ */
const SOCIALS = [
  { label: 'LinkedIn',   platform: 'Profesional', href: 'https://www.linkedin.com/in/yesidcasallas/' },
  { label: 'GitHub',     platform: 'Código',      href: 'https://github.com/yesidcasallas/' },
  { label: 'X',         platform: 'Twitter',     href: 'https://x.com/yesidcasallasx' },
]

function Contact() {
  return (
    <section id="contact" className="contact section" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__inner">

          <Reveal>
            <span className="label">Contacto</span>
          </Reveal>

          <Reveal delay={100}>
            <h2 id="contact-title" className="contact__heading">
              Construyamos algo<br />
              <span className="text-accent">juntos</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="contact__sub">
              Estoy abierto a nuevas oportunidades, proyectos freelance o
              simplemente una buena conversación sobre tecnología.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <a
              href="mailto:hola@yesidcasallas.dev"
              className="contact__email"
              aria-label="Enviar correo electrónico"
            >
              hola@yesidcasallas.dev
              <span className="contact__email-arrow" aria-hidden="true">↗</span>
            </a>
          </Reveal>

          <Reveal delay={400}>
            <ul className="social-list" aria-label="Redes sociales">
              {SOCIALS.map(s => (
                <li key={s.label} className="social-item">
                  <a
                    href={s.href}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} — ${s.platform}`}
                  >
                    <span className="social-link__name">
                      <span>{s.label}</span>
                      <span className="social-link__platform">{s.platform}</span>
                    </span>
                    <span className="social-link__arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

        </div>
      </div>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer__inner">
            <p className="footer__copy">© 2025 Yesid Casallas — Diseñado y construido con ♥</p>
            <button
              className="footer__back"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Volver al inicio"
            >
              Volver arriba ↑
            </button>
          </div>
        </div>
      </footer>
    </section>
  )
}

/* ================================================================
   HOME — ROOT COMPONENT
================================================================ */
export function Home({ theme, toggleTheme }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="portfolio">
      <Nav
        theme={theme}
        toggleTheme={toggleTheme}
        scrolled={scrolled}
        scrollTo={scrollTo}
      />
      <Hero scrollTo={scrollTo} />
      <About />
      <Projects />
      <Contact />
    </div>
  )
}
