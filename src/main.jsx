import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// index.css는 global.css로 대체
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
