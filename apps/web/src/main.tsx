import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PopUpPanelProvider } from './context/PopUpPanelContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopUpPanelProvider>
      <App />
    </PopUpPanelProvider>
  </StrictMode>,
)
