import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes estructurales
import Layout from './components/Layout';
import Login from './components/Login'; // <--- IMPORTAMOS EL LOGIN

// Pantallas del sistema
import Dashboard from './components/Dashboard';
import ClientDetails from './components/ClientDetails';
import CalendarView from './components/CalendarView';
import Clientes from './components/Clientes';
import Asistentes from './components/Asistentes';
import Tareas from './components/Tareas';

function App() {
  // Estado para saber quién está usando la app
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Al cargar la app, nos fijamos si ya había iniciado sesión antes
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // EL CANDADO: Si no hay usuario, devolvemos SOLO la pantalla de Login
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // SI EL CANDADO SE ABRE: Mostramos el Layout (menú) y todas las rutas
  return (
    <Layout>
      <Routes>
        {/* Rutas Ocultas (Detalles y Calendario) */}
        <Route path="/client/:id" element={<ClientDetails />} />
        <Route path="/calendar" element={<CalendarView />} />
        
        {/* Rutas del Menú Principal */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} /> 
        <Route path="/asistentes" element={<Asistentes />} />
        <Route path="/tareas" element={<Tareas />} />
      </Routes>
    </Layout>
  );
}

export default App;