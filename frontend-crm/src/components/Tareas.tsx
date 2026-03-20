import { useEffect, useState } from 'react';
import { Plus, Search, CheckSquare, User, Building, Trash2 } from 'lucide-react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';

export default function Tareas() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar las tareas al entrar a la pantalla
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/task');
      setTasks(response.data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para borrar una tarea individual
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta tarea específica?")) {
      try {
        await api.delete(`/task/${id}`);
        fetchTasks(); // Recargar la lista
      } catch (error) {
        alert("Error al eliminar la tarea. Revisa la consola.");
      }
    }
  };

  // Filtro de búsqueda
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
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Tareas</h1>
            <p className="text-slate-500 text-sm">Controla todos los trámites y obligaciones del estudio.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Crear Trámite / Tarea
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative mb-6 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
          placeholder="Buscar por título o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRILLA DE TARJETAS DE TAREAS */}
      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-500">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center border-dashed">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <CheckSquare className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No hay tareas pendientes</h3>
          <p className="text-slate-500 mt-2 max-w-md">
            {searchTerm ? 'Ninguna tarea coincide con tu búsqueda.' : 'Haz clic en "Crear Trámite / Tarea" para comenzar a delegar trabajo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 relative group">
              
              {/* Botón Eliminar (Oculto hasta que pasas el mouse) */}
              <button 
                onClick={() => handleDelete(task.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md"
                title="Eliminar tarea"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <h3 className="font-bold text-slate-800 text-lg mb-2 pr-6 leading-tight">
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                {/* Etiqueta de Cliente */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">
                    {task.client?.name || 'Sin cliente asignado'}
                  </span>
                </div>
                
                {/* Etiqueta de Asistente */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="truncate font-medium">
                    {task.assignedTo?.name || 'Sin asignar'}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* EL MODAL DE CREACIÓN */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks} 
      />
      
    </div>
  );
}