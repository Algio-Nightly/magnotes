import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AIProvider>
      </StateProvider>
    </ThemeProvider>
  </StrictMode>,
)
