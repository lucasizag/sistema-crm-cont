import { useEffect, useState } from 'react';
import { Clock, Pencil, Search, CheckSquare } from 'lucide-react';
import api from '../api';
import EditHoursModal from './EditHoursModal';

export default function Horas({ user }: { user: any }) {
  const [flattenedTasks, setFlattenedTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editingParentTask, setEditingParentTask] = useState<any>(null);
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, usersRes] = await Promise.all([api.get('/task'), api.get('/user')]);
      const tasks = tasksRes.data;
      const assistants = usersRes.data;

      const flatList: any[] = [];

      tasks.forEach((task: any) => {
        if (task.status === 'COMPLETADA' || task.status === 'completed') return;
        if (!task.subTasks || task.subTasks.length === 0) return;

        task.subTasks.forEach((st: any) => {
          // Si no es admin, solo ve los renglones que tiene asignados
          if (!isAdmin && st.assignedTo !== user.id) return;

          const assistantName = assistants.find((a: any) => a.id === st.assignedTo)?.name || '-';
          
          flatList.push({
            parentTask: task,
            subTaskId: st.id,
            clientName: task.client?.name || 'General',
            mainTitle: task.title,
            subTitle: st.title,
            assistantName: assistantName,
            est: st.estimatedHours ? parseFloat(st.estimatedHours) : 0,
            inc: (st.incurredHoursData || []).reduce((sum: number, item: any) => sum + (parseFloat(item.hours) || 0), 0)
          });
        });
      });

      setFlattenedTasks(flatList);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredTasks = flattenedTasks.filter(item => 
    searchTerm === "" || 
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.mainTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-[1500px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 border border-amber-200 shadow-sm"><Clock className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Auditoría de Horas</h1>
            <p className="text-slate-500 text-sm">Control de rentabilidad y tiempos por sub-tarea.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input type="text" placeholder="Buscar cliente o tarea..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none w-full sm:w-64" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 text-center">
             <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
             <p className="text-slate-500 font-medium">No hay tareas activas para auditar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Nombre / Razón Social <span className="text-slate-400 lowercase font-normal">(Trámite)</span></th>
                  <th className="p-4 text-center">Asistente</th>
                  <th className="p-4 text-center">Hrs. Establecidas</th>
                  <th className="p-4 text-center text-amber-600">Hrs. Incurridas</th>
                  <th className="p-4 text-center text-indigo-600">Hrs. Restantes</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(item => {
                  const rest = item.est - item.inc;

                  return (
                    <tr key={item.subTaskId} className="hover:bg-slate-50 transition">
                      <td className="p-4 align-top">
                        <p className="font-bold text-sm text-slate-800">{item.clientName}</p>
                        {/* AQUÍ ESTÁ EL CAMBIO: Quitamos el item.subTitle para que solo muestre el Trámite Principal */}
                        <p className="text-xs text-slate-500 mt-1">{item.mainTitle}</p>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="text-slate-700 text-sm font-medium">{item.assistantName}</span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="font-bold text-slate-700">{item.est > 0 ? item.est : '-'}</span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{item.inc > 0 ? item.inc : '0'}</span>
                      </td>
                      <td className="p-4 text-center align-middle">
                        <span className={`font-bold px-3 py-1 rounded-lg border ${rest < 0 ? 'text-red-600 bg-red-50 border-red-100' : rest === 0 && item.est > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                          {item.est > 0 ? rest : '-'}
                        </span>
                      </td>
                      <td className="p-4 text-right align-middle">
                        <button onClick={() => { setEditingParentTask(item.parentTask); setEditingSubTaskId(item.subTaskId); }} className="text-slate-400 hover:text-amber-600 bg-white hover:bg-amber-50 p-2 rounded-lg border border-transparent hover:border-amber-100 transition shadow-sm" title="Editar Horas">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditHoursModal isOpen={!!editingParentTask} onClose={() => setEditingParentTask(null)} onSuccess={() => { setEditingParentTask(null); fetchData(); }} parentTask={editingParentTask} subTaskId={editingSubTaskId} />
    </div>
  );
}