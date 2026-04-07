import { useEffect, useState } from 'react';
import { X, Briefcase, Filter, ArrowUpDown, Printer } from 'lucide-react';
import api from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assistant: any;
}

export default function AssistantTasksModal({ isOpen, onClose, assistant }: Props) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros y Ordenamiento
  const [filterClient, setFilterClient] = useState("");
  const [sortBy, setSortBy] = useState("deadline_asc");

  useEffect(() => {
    if (isOpen && assistant) {
      setFilterClient("");
      setSortBy("deadline_asc");
      fetchAssistantTasks();
    }
  }, [isOpen, assistant]);

  const fetchAssistantTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/task');
      const allTasks = res.data;
      
      const extractedTasks: any[] = [];

      allTasks.forEach((parentTask: any) => {
        if (parentTask.status === 'COMPLETADA' || parentTask.status === 'completed') return;
        if (!parentTask.subTasks || parentTask.subTasks.length === 0) return;

        parentTask.subTasks.forEach((subTask: any) => {
          if (subTask.assignedTo === assistant.id) {
            extractedTasks.push({
              id: subTask.id || Math.random(),
              clientName: parentTask.client?.name || 'General',
              clientId: parentTask.client?.id || 'general',
              
              // ACÁ EXTRAEMOS EN ORDEN LA INFORMACIÓN
              mainTitle: parentTask.title,
              mainDescription: parentTask.description, // La Tarea (Detalles / Notas)
              subTitle: subTask.title, // La Sub-tarea
              
              createdAt: subTask.createdAt || '1970-01-01', 
              deadline: subTask.assistantDeadline || subTask.dueDate || '2099-12-31' 
            });
          }
        });
      });

      setTasks(extractedTasks);
    } catch (error) {
      console.error("Error cargando tareas del asistente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !assistant) return null;

  const filteredTasks = tasks.filter(task => 
    filterClient === "" || task.clientId === filterClient
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateAAssigned = new Date(a.createdAt).getTime();
    const dateBAssigned = new Date(b.createdAt).getTime();
    const dateADeadline = new Date(a.deadline).getTime();
    const dateBDeadline = new Date(b.deadline).getTime();

    if (sortBy === 'assigned_asc') return dateAAssigned - dateBAssigned;
    if (sortBy === 'assigned_desc') return dateBAssigned - dateAAssigned;
    if (sortBy === 'deadline_asc') return dateADeadline - dateBDeadline;
    if (sortBy === 'deadline_desc') return dateBDeadline - dateADeadline;
    return 0;
  });

  const uniqueClients = Array.from(new Map(tasks.map(t => [t.clientId, { id: t.clientId, name: t.clientName }])).values());

  const formatDate = (dateString: string) => {
    if (dateString.startsWith('1970') || dateString.startsWith('2099')) return '-';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in print:absolute print:inset-0 print:bg-white print:p-0 print:block">
      
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:overflow-visible print:p-8">
        
        <div className="absolute top-4 right-4 flex gap-2 z-10 print:hidden">
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-sm font-medium text-sm"
            title="Imprimir o Guardar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
          
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 print:border print:border-indigo-200">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Maletín de Trabajo</h2>
            <p className="text-sm text-slate-500 font-medium">Asistente: {assistant.name}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 shrink-0 print:hidden">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Cliente
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            >
              <option value="">Todos los clientes asignados</option>
              {uniqueClients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar por Fechas
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadline_asc">Fecha de Cierre (Más próxima primero)</option>
              <option value="deadline_desc">Fecha de Cierre (Más lejana primero)</option>
              <option value="assigned_desc">Fecha Asignada (Más recientes primero)</option>
              <option value="assigned_asc">Fecha Asignada (Más antiguas primero)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto flex-1 min-h-[300px] print:overflow-visible print:border-none print:shadow-none">
          {isLoading ? (
            <div className="flex justify-center py-20 print:hidden"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : sortedTasks.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Este asistente no tiene tareas activas.</p>
            </div>
          ) : (
            <table className="w-full text-left print:text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200 sticky top-0 print:static print:bg-transparent print:border-b-2 print:border-slate-800 print:text-slate-800">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4 w-1/2">Trámite / Tarea</th>
                  <th className="p-4 text-center">Fecha Asignada</th>
                  <th className="p-4 text-center text-indigo-600 print:text-slate-800">Fecha Cierre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {sortedTasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition print:break-inside-avoid">
                    <td className="p-4 align-top">
                      <span className="font-bold text-sm text-slate-800">{task.clientName}</span>
                    </td>
                    <td className="p-4 align-top">
                      {/* 1. TÍTULO DEL TRÁMITE */}
                      <p className="font-bold text-sm text-slate-800 print:text-slate-900">{task.mainTitle}</p>
                      
                      {/* 2. TAREA (DETALLES / NOTAS) */}
                      {task.mainDescription && (
                        <p className="text-xs text-slate-500 mt-1 mb-1.5 print:text-slate-600 whitespace-pre-wrap">
                          {task.mainDescription}
                        </p>
                      )}
                      
                      {/* 3. SUB-TAREA */}
                      <p className="font-semibold text-sm text-indigo-700 mt-1 print:text-slate-900">
                        ↳ {task.subTitle}
                      </p>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <span className="text-slate-600 text-sm font-medium bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 print:border-none print:bg-transparent print:p-0">
                        {formatDate(task.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 text-center align-middle">
                      <span className="text-indigo-700 text-sm font-bold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 print:border-none print:bg-transparent print:p-0 print:text-slate-900">
                        {formatDate(task.deadline)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}