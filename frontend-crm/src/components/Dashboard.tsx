import { useEffect, useState } from 'react';
import { 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Clock,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  client?: { id: string; name: string };
  assignedTo?: { name: string };
}

interface Stats {
  totalClients: number;
  totalPending: number;
  totalUrgent: number;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ totalClients: 0, totalPending: 0, totalUrgent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, tasksRes] = await Promise.all([
        api.get('/client'),
        api.get('/task')
      ]);

      const allTasks: Task[] = tasksRes.data;
      const allClients = clientsRes.data;

      const pendingTasks = allTasks.filter(t => t.status === 'PENDIENTE');

      const today = new Date();
      const urgentTasks = pendingTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3; 
      });

      setStats({
        totalClients: allClients.length,
        totalPending: pendingTasks.length,
        totalUrgent: urgentTasks.length
      });

      const sortedUrgent = urgentTasks.sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      setTasks(sortedUrgent.slice(0, 5));

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
    try {
      await api.delete(`/task/${taskId}`);
      fetchDashboardData(); 
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      alert("No se pudo eliminar la tarea");
    }
  };

  // Pantalla de carga profesional
  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Sincronizando el estudio...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        
        {/* --- CABECERA --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
            <p className="text-slate-500 mt-1">Resumen general de clientes y tareas pendientes.</p>
          </div>
          <Link 
            to="/calendar" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Calendar className="w-5 h-5" />
            Ver Calendario Completo
          </Link>
        </div>

        {/* --- SECCIÓN 1: TARJETAS DE RESUMEN (AHORA SON ENLACES CLICKEABLES) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Tarjeta Clientes -> Enlace a /client */}
          <Link to="/client" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md hover:border-blue-300 transition group cursor-pointer">
            <div className="bg-blue-50 p-4 rounded-xl text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition">Total Clientes</p>
              <h3 className="text-3xl font-bold text-slate-800 group-hover:text-blue-600 transition">{stats.totalClients}</h3>
            </div>
          </Link>

          {/* Tarjeta Pendientes -> Enlace a /task */}
          <Link to="/task" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md hover:border-amber-300 transition group cursor-pointer">
            <div className="bg-amber-50 p-4 rounded-xl text-amber-600 border border-amber-100 group-hover:bg-amber-100 transition">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-600 transition">Tareas Pendientes</p>
              <h3 className="text-3xl font-bold text-slate-800 group-hover:text-amber-600 transition">{stats.totalPending}</h3>
            </div>
          </Link>

          {/* Tarjeta Urgencias -> Baja a la Agenda Prioritaria */}
          <a href="#agenda-prioritaria" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition relative overflow-hidden group cursor-pointer hover:border-red-300">
            {stats.totalUrgent > 0 && (
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            )}
            <div className="flex items-center gap-5">
              <div className="bg-red-50 p-4 rounded-xl text-red-600 border border-red-100 group-hover:bg-red-100 transition">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider group-hover:text-red-500 transition">Atención Requerida</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-red-600 leading-none">{stats.totalUrgent}</h3>
                  <p className="text-xs text-red-400 font-medium mb-1">Vencen pronto</p>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* --- SECCIÓN 2: AGENDA PRIORITARIA --- */}
        <div id="agenda-prioritaria" className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="p-6 sm:p-8 relative z-10">
            
            {/* TÍTULO LIMPIADO */}
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-white">
              <div className="bg-slate-800 p-2 rounded-lg text-amber-400 border border-slate-700">
                <Clock className="w-5 h-5" />
              </div>
              Agenda Prioritaria
            </h2>

            {tasks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => {
                    const isOverdue = new Date(task.dueDate) < new Date();
                    
                    return (
                      <div key={task.id} className="bg-slate-800/60 backdrop-blur-md p-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group relative flex flex-col justify-between">
                        
                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1.5 bg-slate-900/80 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100 transition shadow-sm"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="pr-8 mb-4">
                          <h3 className="font-bold text-lg text-slate-100 leading-tight mb-1 truncate">{task.title}</h3>
                          <p className="text-sm text-slate-400 mb-4 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {task.client?.name || 'Cliente desconocido'}
                          </p>
                          
                          <div className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md ${isOverdue ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {new Date(task.dueDate).toLocaleDateString()} 
                            {isOverdue && <span className="ml-1 opacity-80">- Vencida</span>}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-600">
                              {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-xs truncate max-w-[100px]">{task.assignedTo?.name || 'Sin asignar'}</span>
                          </div>
                          
                          {task.client?.id && (
                            <Link to={`/client/${task.client.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform">
                              Ir al cliente <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>
            ) : (
              /* ESTADO VACÍO: Si no hay urgencias */
              <div className="bg-slate-800/40 border border-slate-700 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-emerald-500/10 p-4 rounded-full mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">¡Todo al día!</h3>
                <p className="text-slate-400 text-sm mt-1">No hay tareas urgentes ni vencidas en los próximos 3 días.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}