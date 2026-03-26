import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes estructurales
import Layout from './components/Layout';
import Login from './components/Login';

// Pantallas del sistema
import Dashboard from './components/Dashboard';
import ClientDetails from './components/ClientDetails';
import CalendarView from './components/CalendarView';
import Clientes from './components/Clientes';
import Asistentes from './components/Asistentes';
import Tareas from './components/Tareas';
import PanelAsistente from './components/PanelAsistente'; // <--- IMPORTANTE: Nueva pantalla

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crm_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Routes>
        {/* --- RUTA DE INICIO DINÁMICA --- */}
        <Route 
          path="/" 
          element={
            isAdmin 
              ? <Dashboard /> 
              : <PanelAsistente user={currentUser} />
          } 
        />

        {/* --- RUTAS COMPARTIDAS (con filtros internos) --- */}
        <Route path="/tareas" element={<Tareas user={currentUser} />} />
        <Route path="/clientes" element={<Clientes user={currentUser} />} />

        {/* --- RUTAS EXCLUSIVAS PARA ADMIN (KARINA) --- */}
        {isAdmin && (
          <>
            <Route path="/asistentes" element={<Asistentes />} />
            <Route path="/client/:id" element={<ClientDetails user={currentUser} />} />           
            <Route path="/calendar" element={<CalendarView />} />
          </>
        )}

        {/* Redirección por si un asistente intenta entrar a una ruta de admin */}
        {!isAdmin && (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Layout>
  );
}

export default App;