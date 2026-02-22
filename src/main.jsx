import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AccessibilityProvider } from './contexts/AccessibilityContext.jsx'
import './main.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </React.StrictMode>
)