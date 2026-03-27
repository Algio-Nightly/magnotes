import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { StateProvider } from './context/NoteContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AIProvider } from './context/AIContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <StateProvider>
        <AIProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AIProvider>
      </StateProvider>
    </ThemeProvider>
  </StrictMode>,
)
