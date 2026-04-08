import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import StatsPage from './pages/StatsPage.jsx'

// 카카오 SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);
}

const isStats = window.location.pathname === '/stats';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isStats ? <StatsPage /> : <App />}
  </StrictMode>,
)
