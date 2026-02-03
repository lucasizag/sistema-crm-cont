import { useEffect, useState } from 'react';
import { 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Clock,
  Trash2
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

  if (loading) return <div className="p-6 text-center text-gray-500">Calculando estadísticas...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6 mb-10 px-4">
      
      {/* --- BOTÓN NUEVO PARA IR AL CALENDARIO --- */}
      <div className="flex justify-end mb-6">
        <Link 
          to="/calendar" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 shadow-lg transition"
        >
          <Calendar className="w-5 h-5" />
          Ver Calendario Completo
        </Link>
      </div>

      {/* SECCIÓN 1: TARJETAS DE RESUMEN (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Total Clientes</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalClients}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Tareas Pendientes</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalPending}</h3>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <ClipboardList className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Atención Requerida</p>
            <h3 className="text-3xl font-bold text-red-600">{stats.totalUrgent}</h3>
            <p className="text-xs text-red-400 mt-1">Vencidas o vencen pronto</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: LISTA DE PRIORIDAD ALTA */}
      {tasks.length > 0 && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-xl p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            Agenda Prioritaria: Lo que hay que hacer YA
          </h2>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
                const isOverdue = new Date(task.dueDate) < new Date();
                
                return (
                  <div key={task.id} className="bg-white/10 backdrop-blur-sm p-4 rounded-md border border-white/10 hover:bg-white/20 transition group relative">
                    
                    {/* --- BOTÓN DE ELIMINAR --- */}
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-400 p-1 bg-gray-800/50 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex justify-between items-start pr-6">
                      <div>
                        <h3 className="font-bold text-lg truncate pr-2">{task.title}</h3>
                        <p className="text-sm text-gray-300 mb-2">
                          {task.client?.name || 'Cliente desconocido'}
                        </p>
                        
                        <div className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded ${isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()} 
                          {isOverdue && <span className="ml-1">(Vencida)</span>}
                        </div>
                      </div>
                      
                      {task.client?.id && (
                        <Link to={`/client/${task.client.id}`} className="text-gray-400 hover:text-white transition mt-8">
                          <ArrowRight className="w-6 h-6" />
                        </Link>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                      <span>Responsable:</span>
                      <span className="text-white font-medium">
                        {task.assignedTo?.name || 'Sin asignar'}
                      </span>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      )}
    </div>
  );
}