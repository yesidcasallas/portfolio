import { useState, useEffect } from 'react'
import { Home } from './pages/Home'
import { LungCancerDetector } from './pages/LungCancerDetector'
import { LungCancerProject } from './pages/LungCancerProject'
import './App.css'

export type Route = 'home' | 'detector' | 'project'

function getRouteFromHash(): Route {
  const hash = window.location.hash
  if (hash === '#/detector') return 'detector'
  if (hash === '#/project') return 'project'
  return 'home'
}

function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (to: Route) => {
    const hash = to === 'home' ? '#/' : `#/${to}`
    window.location.hash = hash
  }

  return (
    <>
      {route === 'home' && <Home navigate={navigate} />}
      {route === 'detector' && <LungCancerDetector navigate={navigate} />}
      {route === 'project' && <LungCancerProject navigate={navigate} />}
    </>
  )
}

export default App
