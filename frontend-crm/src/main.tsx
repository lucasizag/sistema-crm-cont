import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // <--- IMPORTAR

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>  {/* Router 1 (El Padre) */}
  <App />        {/* Dentro de App tenías el Router 2 -> ¡Error! */}
</BrowserRouter>
  </React.StrictMode>,
)