import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

// --- CAMBIOS PARA DATE-FNS v2 ---
// Importamos cada función por separado (sin llaves)
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es'; // Importación directa del español
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Task {
  id: string;
  title: string;
  dueDate: string;
  client: { id: string; name: string };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientId: string;
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/task');
      const tasks: Task[] = res.data;

      const calendarEvents = tasks
        .filter(t => t.dueDate)
        .map(t => {
            // Truco: Agregamos horas para asegurar que caiga en el día correcto visualmente
            const date = new Date(t.dueDate);
            date.setHours(date.getHours() + 12); 

            return {
                id: t.id,
                title: `${t.title} - ${t.client?.name || '?' }`,
                start: date,
                end: date,
                clientId: t.client?.id
            };
        });

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error cargando calendario", error);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.clientId) {
      navigate(`/client/${event.clientId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-xl h-[85vh] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📅 Calendario de Vencimientos
        </h1>
        <Link to="/" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Inicio
        </Link>
      </div>

      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture='es'
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día"
          }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event: CalendarEvent) => {
             const isPast = event.start < new Date();
             return {
               style: {
                 backgroundColor: isPast ? '#EF4444' : '#3B82F6',
                 borderRadius: '4px',
                 color: 'white',
                 border: 'none'
               }
             }
          }}
        />
      </div>
    </div>
  );
}