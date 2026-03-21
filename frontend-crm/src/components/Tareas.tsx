import { useEffect, useState } from 'react';
import { Plus, Search, CheckSquare, User, Building, Trash2 } from 'lucide-react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';

export default function Tareas({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/task');
      
      // FILTRO DE SEGURIDAD: 
      // Si es admin ve todo, si es asistente solo lo que tiene su ID asignado
      const data = isAdmin 
        ? response.data 
        : response.data.filter((t: any) => t.assignedTo?.id === user.id);
        
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
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      
      {/* CABECERA */}
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
        
        {/* SOLO EL ADMIN CREA TAREAS */}
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Crear Trámite / Tarea
          </button>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Buscar tarea..."
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
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 relative group">
              
              {/* SOLO ADMIN PUEDE BORRAR */}
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(task.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <h3 className="font-bold text-slate-800 text-lg mb-2 pr-6 leading-tight truncate">
                {task.title}
              </h3>
              
              <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">
                {task.description || 'Sin descripción'}
              </p>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">{task.client?.name || 'General'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="truncate font-medium">{task.assignedTo?.name || 'Sin asignar'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <CreateTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchTasks} 
        />
      )}
    </div>
  );
}