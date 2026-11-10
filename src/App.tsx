import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { SimpleCamera } from './SimpleCamera'

function App() {

  return (
    <section id="center">
      <div className="hero">
        <img src={heroImg} className="base" width="170" height="179" alt="" />
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
      </div>
      <div>
        <h1>Camera Workshop Demo</h1>
      </div>
      <SimpleCamera />
    </section>
  )
}

export default App
