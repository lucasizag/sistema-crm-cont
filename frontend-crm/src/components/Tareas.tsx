import { useEffect, useState } from 'react';
import { Plus, Search, CheckSquare, Trash2, Pencil, Filter, Calendar as CalendarIcon, Square, CheckCircle2 } from 'lucide-react';import api from '../api';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal'; 

export default function Tareas({ user }: { user: any }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<any>(null);

  // --- ESTADOS DE FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  // NUEVO: Filtro de estado (Por defecto muestra solo las pendientes)
  const [filterStatus, setFilterStatus] = useState("PENDIENTE");

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

  const toggleTaskStatus = async (task: any) => {
    try {
      // Normalizamos el estado por si viene como 'completed' o 'COMPLETADA'
      const isCompleted = task.status === 'COMPLETADA' || task.status === 'completed';
      const newStatus = isCompleted ? 'PENDIENTE' : 'COMPLETADA';
      
      await api.patch(`/task/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (error) { console.error(error); }
  };

  // --- LÓGICA DE FILTRADO MÚLTIPLE ---
  const filteredTasks = tasks.filter(task => {
    
    // Normalizamos el estado actual de la tarea para comparar fácil
    const isCompleted = task.status === 'COMPLETADA' || task.status === 'completed';
    const taskStatus = isCompleted ? 'COMPLETADA' : 'PENDIENTE';

    // 1. Filtro por Estado
    const matchStatus = filterStatus === "" || taskStatus === filterStatus;

    // 2. Filtro por Palabra Clave (Título o Descripción)
    const matchSearch = searchTerm === "" || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Filtro por Cliente
    const matchClient = filterClient === "" || task.client?.id === filterClient;

    // 4. Filtro por Fechas
    const taskDate = task.dueDate ? task.dueDate.split('T')[0] : '';
    const matchDateFrom = filterDateFrom === "" || taskDate >= filterDateFrom;
    const matchDateTo = filterDateTo === "" || taskDate <= filterDateTo;

    return matchStatus && matchSearch && matchClient && matchDateFrom && matchDateTo;
  });

  // Extraer clientes únicos para el menú desplegable del filtro
  const uniqueClients = Array.from(new Map(tasks.filter(t => t.client).map(t => [t.client.id, t.client])).values());

  const getDeadlineStyle = (dueDate: string, status: string) => {
    const isCompleted = status === 'COMPLETADA' || status === 'completed';
    if (isCompleted) return { color: 'bg-slate-100 text-slate-500 border-slate-200', text: 'Completada' };
    if (!dueDate) return { color: 'bg-slate-50 text-slate-600', text: 'Sin fecha' };
    
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (86400000));
    
    if (diffDays < 0) return { color: 'bg-red-100 text-red-700 border-red-200 font-bold', text: 'VENCIDA' };
    if (diffDays <= 3) return { color: 'bg-orange-100 text-orange-700 border-orange-200 font-bold', text: 'Urgente' };
    return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'A tiempo' };
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-[1500px] mx-auto">
      
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
              {isAdmin ? 'Control general en formato lista.' : 'Listado de tus tareas.'}
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

      {/* BARRA DE FILTROS (Ahora usa Flex-Wrap para que entren todos bien) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
        
        {/* NUEVO: Filtro de Estado */}
        <div className="w-full sm:w-auto flex-1 min-w-[140px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Estado
          </label>
          <select
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-700"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="PENDIENTE">⏳ Solo Pendientes</option>
            <option value="COMPLETADA">✅ Terminadas</option>
          </select>
        </div>

        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Palabra clave
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isAdmin && (
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Cliente
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {uniqueClients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="none">-- Tareas Generales --</option>
            </select>
          </div>
        )}

        <div className="w-full sm:w-auto flex-1 min-w-[140px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Desde
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex-1 min-w-[140px]">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Hasta
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>

        {/* Botón para limpiar filtros */}
        {(searchTerm || filterClient || filterDateFrom || filterDateTo || filterStatus !== "PENDIENTE") && (
          <div className="w-full sm:w-auto">
            <button 
              onClick={() => {
                setSearchTerm(""); setFilterClient(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterStatus("PENDIENTE");
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* TABLA DE TAREAS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 text-center">
            <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No se encontraron tareas</h3>
            <p className="text-slate-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda o cambia el "Estado".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-16 text-center">Estado</th>
                  <th className="p-4">Tarea y Descripción</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4 text-center">Horas</th>
                  {isAdmin && <th className="p-4 text-center">Responsable</th>}
                  <th className="p-4">Vencimiento</th>
                  {isAdmin && <th className="p-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const isCompleted = task.status === 'COMPLETADA' || task.status === 'completed';
                  const urgency = getDeadlineStyle(task.dueDate, isCompleted ? 'COMPLETADA' : 'PENDIENTE');
                  const diff = task.actualHours - task.estimatedHours;
                  const hoursColor = diff > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium';

                  return (
                    <tr key={task.id} className="hover:bg-slate-50 transition">
                      
                      {/* CHECKBOX PARA MARCAR TERMINADO */}
                      <td className="p-4 text-center align-top pt-5">
                        <button onClick={() => toggleTaskStatus(task)} className={`transition-colors ${isCompleted ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-indigo-500'}`}>
                          {isCompleted ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                        </button>
                      </td>

                      {/* TAREA Y DESCRIPCIÓN */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          {task.condition === 'Especial' && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                              ESPECIAL ⭐
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className={`text-xs mt-1.5 whitespace-pre-line ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                            {task.description}
                          </p>
                        )}
                        {!isCompleted && <span className={`text-[10px] px-2 py-0.5 rounded border mt-2 inline-block ${urgency.color}`}>{urgency.text}</span>}
                      </td>

                      {/* CLIENTE */}
                      <td className="p-4 align-top pt-5">
                        {task.client ? (
                          <span className="text-slate-700 text-sm font-medium">{task.client.name}</span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">General</span>
                        )}
                      </td>

                      {/* HORAS */}
                      <td className="p-4 text-center align-top">
                        <div className="flex flex-col items-center text-xs">
                          <span className="text-slate-500">Est: <b className="text-slate-700">{task.estimatedHours}h</b></span>
                          <span className="text-slate-800 mt-0.5">Real: <b>{task.actualHours}h</b></span>
                          {(task.estimatedHours > 0 || task.actualHours > 0) && (
                            <span className={`mt-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 ${hoursColor}`}>
                              {diff > 0 ? `+${diff}h` : `${diff}h`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* RESPONSABLE (Solo Admin) */}
                      {isAdmin && (
                        <td className="p-4 text-center align-top pt-5">
                          {task.assignedTo ? (
                            <span className="text-slate-700 text-sm font-semibold">{task.assignedTo.name}</span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-200">Sin asignar</span>
                          )}
                        </td>
                      )}

                      {/* VENCIMIENTO */}
                      <td className="p-4 text-sm font-medium text-slate-600 align-top pt-5">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-AR') : '-'}
                      </td>
                      
                      {/* ACCIONES (Solo Admin) */}
                      {isAdmin && (
                        <td className="p-4 text-right align-top pt-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingTask(task)} className="text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 p-1.5 rounded-lg border border-transparent hover:border-indigo-100 transition-all shadow-sm" title="Editar">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition-all shadow-sm" title="Eliminar">
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
        )}
      </div>

      {/* MODALES */}
      {isAdmin && (
        <CreateTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchTasks} 
        />
      )}

      {isAdmin && (
        <EditTaskModal 
          isOpen={!!editingTask} 
          onClose={() => setEditingTask(null)} 
          onSuccess={() => {
            setEditingTask(null);
            fetchTasks(); 
          }} 
          task={editingTask}
        />
      )}

    </div>
  );
} 