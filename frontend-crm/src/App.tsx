import { Routes, Route } from 'react-router-dom'; // <--- Quitamos 'BrowserRouter as Router'
import ClientList from './components/ClientList';
import ClientDetails from './components/ClientDetails';
import CalendarView from './components/CalendarView';

function App() {
  return (
    // Ya no usamos <Router> aquí porque main.tsx ya lo tiene
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Routes>
        <Route path="/" element={<ClientList />} />
        <Route path="/client/:id" element={<ClientDetails />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Routes>
    </div>
  );
}

export default App;