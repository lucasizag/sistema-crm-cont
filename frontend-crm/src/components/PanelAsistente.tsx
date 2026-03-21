import { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function PanelAsistente({ user }: { user: any }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    const res = await api.get('/task');
    const myTasks = res.data.filter((t: any) => t.assignedTo?.id === user.id && t.status !== 'completed');
    setTasks(myTasks);
  };

  // Recibimos las actualHours como parámetro
  const completeTask = async (id: string, comment: string, actualHours: number) => {
    await api.patch(`/task/${id}`, { status: 'completed', comment, actualHours });
    fetchMyTasks();
    alert("¡Tarea terminada y horas registradas!");
  };

  // Función para mostrar la fecha más bonita
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    // Sumamos un día porque a veces las fechas UTC restan 1 día en frontend
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Mis Tareas Pendientes</h2>
      
      <div className="grid gap-4">
        {tasks.length === 0 && <p className="text-slate-500">No tienes tareas pendientes. ¡Buen trabajo!</p>}
        
        {tasks.map((task: any) => (
          <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{task.title}</h3>
                <p className="text-slate-600 text-sm mb-2">{task.description}</p>
                
                {/* ETIQUETAS DE INFORMACIÓN */}
                <div className="flex gap-3">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Vence: {formatDate(task.dueDate)}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Estimado: {task.estimatedHours} hs
                  </span>
                </div>
              </div>
              
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                Pendiente
              </span>
            </div>

            {/* FORMULARIO DE ENTREGA */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                
                <div className="w-full sm:w-1/3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horas Reales (hs)</label>
                  <input 
                    type="number" id={`hours-${task.id}`} step="0.5" min="0" placeholder="Ej: 2.5" required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Comentario para Karina</label>
                  <input 
                    type="text" id={`comment-${task.id}`} placeholder="Observaciones finales..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  const commentInput = document.getElementById(`comment-${task.id}`) as HTMLInputElement;
                  const hoursInput = document.getElementById(`hours-${task.id}`) as HTMLInputElement;
                  
                  if (!hoursInput.value) {
                    alert("Por favor, ingresa cuántas horas te llevó la tarea.");
                    return;
                  }

                  completeTask(task.id, commentInput.value, parseFloat(hoursInput.value));
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm mt-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Entregar Tarea
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}