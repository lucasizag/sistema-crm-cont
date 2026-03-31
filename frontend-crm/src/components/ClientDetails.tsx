import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Trash2, CheckSquare, Square, Pencil, AlertTriangle, Eye, ListChecks
} from 'lucide-react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal'; 
import ViewTaskModal from './ViewTaskModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  subTasks?: any[];
  client?: { id: string; name: string };
}

interface Client {
  id: string;
  name: string;
  cuit: string;
  taxType: string;
  closeMonth?: string; 
  dropDate?: string;   
  predeterminedTasks?: { task: string; month: string; observations: string }[]; 
  tasks: Task[];
}

export default function ClientDetails({ user }: { user: any }) {
  const { id } = useParams();
  
  const isAdmin = user?.role === 'admin';
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null); 

  const fetchClientData = useCallback(async () => {
    if (!id) return;
    try {
      setError(""); 
      const clientRes = await api.get(`/client/${id}`);
      setClient(clientRes.data);
    } catch (err: any) {
      console.error("ERROR CRÍTICO:", err);
      setError(err.response?.data?.message || err.message || "Error desconocido al servidor.");
    }
  }, [id]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleCreateTask = () => setIsCreateModalOpen(true);

  const handleEditTask = (task: Task) => {
    const taskWithClient = { ...task, client: { id: client?.id, name: client?.name } };
    setEditingTask(taskWithClient as any); 
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const isCompleted = task.status === 'COMPLETADA' || task.status === 'completed';
      const newStatus = isCompleted ? 'PENDIENTE' : 'COMPLETADA';
      await api.patch(`/task/${task.id}`, { status: newStatus });
      fetchClientData();
    } catch (error) { console.error(error); }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Borrar trámite por completo?')) return;
    try { 
      await api.delete(`/task/${taskId}`); 
      fetchClientData(); 
    } catch (error) { console.error(error); }
  };

  if (error) return (
    <div className="p-10 text-center flex flex-col items-center justify-center h-[50vh]">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Ups, algo salió mal</h2>
      <p className="text-red-600 mt-2 bg-red-50 p-4 rounded border border-red-200">{error}</p>
      <Link to="/" className="mt-6 text-indigo-600 hover:underline">Volver al inicio</Link>
    </div>
  );

  if (!client) return <div className="p-10 text-center text-slate-500">Cargando datos del cliente...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 mb-20 animate-fade-in">
      <Link to="/" className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 w-fit transition-colors">
        <ArrowLeft className="w-5 h-5 mr-1" /> Volver al listado
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 border-l-4 border-l-indigo-600">
        <h1 className="text-3xl font-bold text-slate-800">{client.name}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-slate-600 font-medium">
          <p>🆔 CUIT: {client.cuit || 'No especificado'}</p>
          <p>⚖️ {client.taxType || 'Sin condición'}</p>
          <p>📅 Cierre: {client.closeMonth || 'No especificado'}</p>
        </div>

        {client.predeterminedTasks && client.predeterminedTasks.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-500" /> Tareas Predeterminadas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {client.predeterminedTasks.map((pt, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:shadow-md transition-shadow">
                  <p className="font-bold text-sm text-slate-800">{pt.task || 'Sin título'}</p>
                  {pt.month && <p className="text-xs text-indigo-600 font-medium mt-1.5 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Mes: {pt.month}</p>}
                  {pt.observations && <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded-lg border border-slate-100 italic">"{pt.observations}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Control de Trámites
          </h2>
          {isAdmin && (
            <button 
              onClick={handleCreateTask} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              + Nuevo Trámite
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {client.tasks && client.tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-12 text-center"></th>
                    <th className="p-4">Trámite / Tarea</th>
                    {isAdmin && <th className="p-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {client.tasks.map(task => {
                    const isCompleted = task.status === 'COMPLETADA' || task.status === 'completed';

                    return (
                      <tr key={task.id} className="hover:bg-slate-50 transition">
                        
                        <td className="p-4 text-center align-middle">
                          <button onClick={() => toggleTaskStatus(task)} className={`transition-colors ${isCompleted ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-indigo-500'}`}>
                            {isCompleted ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                          </button>
                        </td>

                        <td className="p-4 align-middle">
                          <p className={`font-bold text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                        </td>
                        
                        {isAdmin && (
                          <td className="p-4 text-right align-middle">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setViewingTask(task)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 p-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all shadow-sm" title="Ver Detalles">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEditTask(task)} className="text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 p-1.5 rounded-lg border border-transparent hover:border-indigo-100 transition-all shadow-sm" title="Editar">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition-all shadow-sm" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay trámites creados para este cliente.</p>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchClientData} clientId={client.id} />
      <EditTaskModal isOpen={!!editingTask} onClose={() => setEditingTask(null)} onSuccess={() => { setEditingTask(null); fetchClientData(); }} task={editingTask} />
      <ViewTaskModal isOpen={!!viewingTask} onClose={() => setViewingTask(null)} task={viewingTask} />
    </div>
  );
}