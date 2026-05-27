import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ask the browser to keep our storage (the Supabase session lives in
// localStorage). On installed PWAs this is usually granted automatically and
// helps the login survive iOS storage eviction after periods of inactivity.
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persisted?.().then((already) => {
    if (!already) navigator.storage.persist().catch(() => {})
  }).catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
