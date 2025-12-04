

export function Home ()
{

    return (
        <>
            <header>
                <h1>Bienvenido</h1>
            </header>
            <main>
                <section aria-label="Introducción">
                    <img src="/user.webp" alt="Fotografía de Yesid Casallas" />
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
                        Además, el sistema informa con precisión sobre la disponibilidad, indicando si un
                        medicamento está agotado a nivel nacional o si se trata de un fármaco controlado.
                    </p>
                </section>
            </main>
            <footer>
                <section aria-labelledby="contact-title">
                    <h2 id="contact-title">Contacto</h2>
                    <address>
                        <ul>
                            <li>
                                <a href="https://www.linkedin.com/in/yesidcasallas/" target="_blank" rel="noopener noreferrer">Linkedin</a>
                            </li>
                            <li>
                                <a href="https://github.com/yesidcasallas/" target="_blank" rel="noopener noreferrer">GitHub</a>
                            </li>
                            <li>
                                <a href="https://x.com/yesidcasallasx" target="_blank" rel="noopener noreferrer">X</a>
                            </li>
                        </ul>
                    </address>
                </section>
                <section aria-labelledby="interests-title">
                    <h2 id="interests-title">Me gusta</h2>
                    <ul>
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