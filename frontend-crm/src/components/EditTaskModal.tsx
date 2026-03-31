import { useEffect, useState } from 'react';
import { X, PencilLine, Plus, Trash2 } from 'lucide-react';
import api from '../api';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; task: any; }

export default function EditTaskModal({ isOpen, onClose, onSuccess, task }: Props) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);

  const [generalTitle, setGeneralTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');

  const createEmptyRow = () => ({ id: Date.now(), title: '', assignedTo: '', createdAt: '', assistantDeadline: '', dueDate: '' });
  const [taskRows, setTaskRows] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && task) {
      setDescription(task.description || '');
      setClientId(task.client?.id || '');
      
      // ¿Es una tarea con el sistema NUEVO? (Tiene sub-tareas guardadas)
      if (task.subTasks && task.subTasks.length > 0) {
        setGeneralTitle(task.title || '');
        setTaskRows(task.subTasks);
      } else {
        // Es una tarea con el sistema VIEJO. Hacemos ingeniería inversa para separarla
        let extractedGeneralTitle = task.title || '';
        let extractedRowTitle = task.title || '';

        if (task.title && task.title.includes(' - ')) {
          const parts = task.title.split(' - ');
          extractedGeneralTitle = parts[0].trim();
          // Unimos el resto por si el nombre de la tarea también tenía guiones
          extractedRowTitle = parts.slice(1).join(' - ').trim(); 
        }

        setGeneralTitle(extractedGeneralTitle);
        setTaskRows([{ 
          id: Date.now(), 
          title: extractedRowTitle, 
          assignedTo: task.assignedTo?.id || '', 
          createdAt: task.createdAt ? task.createdAt.split('T')[0] : '', 
          assistantDeadline: task.assistantDeadline ? task.assistantDeadline.split('T')[0] : '', 
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' 
        }]); 
      }
      
      fetchDropdownData();
    }
  }, [isOpen, task]);

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, assistantsRes] = await Promise.all([api.get('/client'), api.get('/user')]);
      setClients(clientsRes.data); setAssistants(assistantsRes.data);
    } catch (error) { console.error("Error cargando listas:", error); }
  };

  const addRow = () => setTaskRows([...taskRows, createEmptyRow()]);
  const removeRow = (id: number) => { if(taskRows.length > 1) setTaskRows(taskRows.filter(row => row.id !== id)); };
  const updateRow = (id: number, field: string, value: string) => {
    setTaskRows(taskRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Un solo PATCH: Actualiza el Padre y guarda la lista de renglones adentro
      await api.patch(`/task/${task.id}`, {
        title: generalTitle || 'Trámite sin título',
        description: description || null,
        clientId: clientId || null,
        subTasks: taskRows,
      });
      onSuccess(); onClose();
    } catch (error) {
      alert('Hubo un error al guardar los cambios.');
    } finally { setLoading(false); }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5" /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><PencilLine className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold text-slate-800">Editar Trámite Completo</h2><p className="text-sm text-slate-500">Modifica el título general o las sub-tareas internas.</p></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título del Trámite</label>
                <input type="text" required className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 text-sm" value={generalTitle} onChange={(e) => setGeneralTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente Asociado</label>
                <select className="block w-full rounded-xl border p-2.5 text-sm focus:border-indigo-500 bg-white border-slate-200" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">-- Sin Cliente Específico --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción / Notas</label>
              <textarea rows={2} className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-800">Sub-tareas (Renglones)</label>
              <button type="button" onClick={addRow} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Agregar renglón</button>
            </div>

            <div className="space-y-4">
              {taskRows.map((row, index) => (
                <div key={row.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-white p-4 sm:p-2 rounded-xl border border-slate-200">
                  <span className="w-6 text-center text-slate-400 font-medium text-sm hidden sm:block mb-2.5">{index + 1}.</span>
                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Sub-tarea</label>
                    <input type="text" required className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none" value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Asignación</label>
                    <input type="date" className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 bg-slate-50" value={row.createdAt} onChange={(e) => updateRow(row.id, 'createdAt', e.target.value)} />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1">Deadline</label>
                    <input type="date" className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 bg-indigo-50/30" value={row.assistantDeadline} onChange={(e) => updateRow(row.id, 'assistantDeadline', e.target.value)} />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-red-500 uppercase mb-1 ml-1">Vencimiento</label>
                    <input type="date" className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600" value={row.dueDate} onChange={(e) => updateRow(row.id, 'dueDate', e.target.value)} />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Responsable</label>
                    <select className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white" value={row.assignedTo} onChange={(e) => updateRow(row.id, 'assignedTo', e.target.value)}>
                      <option value="">-- Sin Asignar --</option>
                      {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => removeRow(row.id)} disabled={taskRows.length === 1} className="p-2 text-slate-300 hover:text-red-500 rounded-lg disabled:opacity-30 mb-0.5"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="w-3/4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-sm">{loading ? 'Guardando...' : `Actualizar Trámite`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}