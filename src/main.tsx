import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from '@/lib/theme'
import { ProfileProvider } from '@/lib/profile'
import { ProgressProvider } from '@/lib/progress'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ProfileProvider>
        <ProgressProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </ProgressProvider>
      </ProfileProvider>
    </ThemeProvider>
  </StrictMode>,
)
