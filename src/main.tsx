import React from 'react'
import ReactDOM from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import './index.css'

// Register GSAP plugins once at application entry — all ScrollTrigger instances
// across the entire site share this single registration.
gsap.registerPlugin(ScrollTrigger)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
