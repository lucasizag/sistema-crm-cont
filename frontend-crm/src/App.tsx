import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientDetails from './components/ClientDetails';
import CalendarView from './components/CalendarView';

// Importamos las 3 pantallas nuevas que acabamos de crear
import Clientes from './components/Clientes';
import Asistentes from './components/Asistentes';
import Tareas from './components/Tareas';

function App() {
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