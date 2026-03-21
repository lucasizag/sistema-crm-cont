import { useEffect, useState } from 'react';
// 1. Agregamos el icono Pencil
import { Plus, Search, CheckSquare, Trash2, Clock, Pencil } from 'lucide-react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';
// 2. Importamos el nuevo modal
import EditTaskModal from './EditTaskModal'; 

export default function Tareas({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 3. Nuevo estado para saber qué tarea estamos editando
  const [editingTask, setEditingTask] = useState<any>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/task');
      const data = isAdmin ? response.data : response.data.filter((t: any) => t.assignedTo?.id === user.id);
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      try {
        await api.delete(`/task/${id}`);
        fetchTasks();
      } catch (error) {
        alert("Error al eliminar la tarea.");
      }
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-AR');
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      
      {/* CABECERA (Igual que antes) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 border border-indigo-200 shadow-sm">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isAdmin ? 'Gestión de Tareas' : 'Mis Tareas Asignadas'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isAdmin ? 'Control total de trámites del estudio.' : 'Listado de tus tareas pendientes.'}
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Crear Trámite / Tarea
          </button>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA (Igual que antes) */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          placeholder="Buscar por tarea, descripción o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRILLA DE TAREAS */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No hay tareas</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 relative group flex flex-col">
              
              <div className="mb-3 pr-16"> {/* Aumentamos el padding right para hacer lugar a los 2 botones */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {task.status === 'completed' ? 'Terminada' : 'Pendiente'}
                  </span>
                  
                  {task.condition === 'Especial' && (
                    <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-purple-200 shadow-sm">
                      ESPECIAL ⭐
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg leading-tight">
                  {task.title}
                </h3>
              </div>

              {task.description && (
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg mb-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-1">Descripción:</span>
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              )}
              
              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Cliente:</span> {task.client?.name || 'General'}
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Asistente:</span> {task.assignedTo?.name || 'Sin asignar'}
                </div>

                <div className="text-sm text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Vencimiento:</span> {formatDate(task.dueDate)}
                </div>
              </div>

              {/* BOTONES DE ADMINISTRADOR (EDITAR Y BORRAR) */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  
                  {/* Botón Editar */}
                  <button 
                    onClick={() => setEditingTask(task)}
                    className="p-1.5 bg-white text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm border border-transparent hover:border-indigo-100 transition-colors"
                    title="Editar tarea"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Botón Eliminar */}
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isAdmin && (
        <CreateTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchTasks} 
        />
      )}

      {/* MODAL DE EDICIÓN */}
      {isAdmin && (
        <EditTaskModal 
          isOpen={!!editingTask} 
          onClose={() => setEditingTask(null)} 
          onSuccess={() => {
            setEditingTask(null);
            fetchTasks(); // Recargamos para ver los cambios
          }} 
          task={editingTask}
        />
      )}

    </div>
  );
}