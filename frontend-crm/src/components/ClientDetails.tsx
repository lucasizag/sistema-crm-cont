import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Trash2, 
  CheckSquare, 
  Square, 
  Pencil, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal'; 
import ViewTaskModal from './ViewTaskModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  condition?: string;
  assignedTo?: { id: string; name: string };
  client?: { id: string; name: string };
  createdAt?: string;
  assistantDeadline?: string;
}

interface Client {
  id: string;
  name: string;
  cuit: string;
  taxType: string;
  closeMonth?: string; 
  dropDate?: string;   
  tasks: Task[];
}

export default function ClientDetails({ user }: { user: any }) {
  const { id } = useParams();
  
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
      const newStatus = task.status === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
      await api.patch(`/task/${task.id}`, { status: newStatus });
      fetchClientData();
    } catch (error) { console.error(error); }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Borrar tarea?')) return;
    try { 
      await api.delete(`/task/${taskId}`); 
      fetchClientData(); 
    } catch (error) { console.error(error); }
  };

  const getDeadlineStyle = (dueDate: string, status: string) => {
    if (status === 'COMPLETADA') return { color: 'bg-slate-100 text-slate-500 border-slate-200', text: 'Completada' };
    if (!dueDate) return { color: 'bg-slate-50 text-slate-600', text: 'Sin fecha' };
    
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (86400000));
    
    if (diffDays < 0) return { color: 'bg-red-100 text-red-700 border-red-200 font-bold', text: 'VENCIDA' };
    if (diffDays <= 3) return { color: 'bg-orange-100 text-orange-700 border-orange-200 font-bold', text: 'Urgente' };
    return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'A tiempo' };
  };

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
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
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Control de Tareas
          </h2>
          <button 
            onClick={handleCreateTask} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            + Nueva Tarea
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {client.tasks && client.tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-12 text-center"></th>
                    {/* CAMBIO: Solo dice "Tarea" */}
                    <th className="p-4">Tarea</th>
                    <th className="p-4 text-center">Responsable</th>
                    <th className="p-4 text-center">Asignación</th>
                    <th className="p-4 text-center text-indigo-600">Deadline Asistente</th>
                    <th className="p-4 text-center text-red-600">Venc. Estudio</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {client.tasks.map(task => {
                    const urgency = getDeadlineStyle(task.dueDate, task.status);

                    return (
                      <tr key={task.id} className="hover:bg-slate-50 transition">
                        
                        <td className="p-4 text-center align-top pt-5">
                          <button onClick={() => toggleTaskStatus(task)} className={`transition-colors ${task.status === 'COMPLETADA' ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-indigo-500'}`}>
                            {task.status === 'COMPLETADA' ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                          </button>
                        </td>

                        {/* CAMBIO: Se eliminó la descripción de aquí */}
                        <td className="p-4 align-top">
                          <div className="flex items-center gap-2 mt-1">
                            <p className={`font-bold text-sm ${task.status === 'COMPLETADA' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </p>
                            {task.condition === 'Especial' && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                                ESPECIAL ⭐
                              </span>
                            )}
                          </div>
                          {task.status !== 'COMPLETADA' && <span className={`text-[10px] px-2 py-0.5 rounded border mt-2 inline-block ${urgency.color}`}>{urgency.text}</span>}
                        </td>

                        <td className="p-4 text-center align-top pt-5">
                          {task.assignedTo ? (
                            <span className="text-slate-700 text-sm font-semibold">
                              {task.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-200">Sin asignar</span>
                          )}
                        </td>

                        <td className="p-4 text-center text-sm font-medium text-slate-500 align-top pt-5">
                          {formatDateSafe(task.createdAt)}
                        </td>

                        <td className="p-4 text-center text-sm font-bold text-indigo-600 align-top pt-5 bg-indigo-50/30">
                          {formatDateSafe(task.assistantDeadline)}
                        </td>

                        <td className="p-4 text-sm font-bold text-red-600 align-top pt-5 text-center">
                          {formatDateSafe(task.dueDate)}
                        </td>
                        
                        <td className="p-4 text-right align-top pt-4">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay tareas creadas para este cliente.</p>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchClientData} 
        clientId={client.id}
      />

      <EditTaskModal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        onSuccess={() => {
          setEditingTask(null);
          fetchClientData();
        }} 
        task={editingTask}
      />

      <ViewTaskModal 
        isOpen={!!viewingTask} 
        onClose={() => setViewingTask(null)} 
        task={viewingTask} 
      />
    </div>
  );
}