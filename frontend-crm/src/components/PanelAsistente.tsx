import { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export default function PanelAsistente({ user }: { user: any }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    const res = await api.get('/task');
    // Filtramos para ver solo las tareas asignadas a este asistente y que no estén terminadas
    const myTasks = res.data.filter((t: any) => t.assignedTo?.id === user.id && t.status !== 'completed');
    setTasks(myTasks);
  };

  const completeTask = async (id: string, comment: string) => {
    await api.patch(`/task/${id}`, { status: 'completed', comment });
    fetchMyTasks();
    alert("¡Tarea terminada!");
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
                <p className="text-slate-600 text-sm">{task.description}</p>
              </div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pendiente
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Comentario para Karina:</label>
              <textarea 
                id={`comment-${task.id}`}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                placeholder="Escribe alguna observación aquí..."
              />
              <button 
                onClick={() => {
                  const comment = (document.getElementById(`comment-${task.id}`) as HTMLTextAreaElement).value;
                  completeTask(task.id, comment);
                }}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" /> Marcar como Terminada
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}