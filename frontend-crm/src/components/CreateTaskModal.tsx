import { useEffect, useState } from 'react';
import { X, Plus, Trash2, ListChecks, MessageSquarePlus } from 'lucide-react';
import api from '../api';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; clientId?: string; taskToEdit?: any; }

export default function CreateTaskModal({ isOpen, onClose, onSuccess, clientId: propClientId }: Props) {
  const [generalTitle, setGeneralTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentDueDate, setParentDueDate] = useState('');
  const [clientId, setClientId] = useState(propClientId || '');
  
  // Agregamos 'comment' y 'showCommentField' (este último solo para la UI)
  const createEmptyRow = () => ({ 
    id: Date.now(), 
    title: '', 
    assignedTo: '', 
    createdAt: '', 
    assistantDeadline: '', 
    estimatedHours: '',
    comment: '',
    showCommentField: false 
  });
  const [taskRows, setTaskRows] = useState([createEmptyRow()]);

  const [clients, setClients] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeneralTitle(''); setDescription(''); setParentDueDate(''); setClientId(propClientId || ''); setTaskRows([createEmptyRow()]);
      fetchDropdownData();
    }
  }, [isOpen, propClientId]); 

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, assistantsRes] = await Promise.all([api.get('/client'), api.get('/user')]);
      setClients(clientsRes.data); setAssistants(assistantsRes.data);
    } catch (error) { console.error("Error cargando listas:", error); }
  };

  const addRow = () => setTaskRows([...taskRows, createEmptyRow()]);
  const removeRow = (id: number) => { if (taskRows.length > 1) setTaskRows(taskRows.filter(row => row.id !== id)); };
  
  const updateRow = (id: number, field: string, value: any) => {
    setTaskRows(taskRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Limpiamos el campo auxiliar 'showCommentField' antes de mandar al backend
      const cleanSubTasks = taskRows.map(({ showCommentField, ...rest }) => rest);

      await api.post('/task', {
        title: generalTitle || 'Trámite sin título',
        description: description || null,
        dueDate: parentDueDate || null,
        clientId: propClientId || clientId || null,
        status: 'PENDIENTE',
        subTasks: cleanSubTasks,
      });
      onSuccess(); onClose();
    } catch (error) {
      alert('Hubo un error al guardar las tareas.');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-6xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5" /></button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><ListChecks className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold text-slate-800">Cargar Trámite General</h2><p className="text-sm text-slate-500">Crea el Trámite y agrégale sus sub-tareas.</p></div>
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
                <select disabled={!!propClientId} className="block w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 bg-white" value={propClientId || clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">-- Sin Cliente Específico --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tarea (Detalles / Notas)</label>
                <textarea rows={2} placeholder="Descripción de la tarea general..." className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-red-500 mb-1">Fecha de Vencimiento</label>
                <input type="date" className="block w-full rounded-xl border-red-200 border p-2.5 bg-red-50 focus:border-red-500 text-sm h-[62px]" value={parentDueDate} onChange={(e) => setParentDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-800">Sub-tareas (Renglones)</label>
              <button type="button" onClick={addRow} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Agregar renglón</button>
            </div>

            <div className="space-y-4">
              {taskRows.map((row, index) => (
                <div key={row.id} className="bg-white p-4 sm:p-2 rounded-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <span className="w-6 text-center text-slate-400 font-medium text-sm hidden sm:block mb-2.5">{index + 1}.</span>
                    
                    <div className="w-full sm:flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Sub-tarea</label>
                      <input type="text" required className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none" value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} />
                    </div>
                    
                    <div className="w-full sm:w-20">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Hrs. Est.</label>
                      <input type="number" step="0.5" className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none" value={row.estimatedHours || ''} onChange={(e) => updateRow(row.id, 'estimatedHours', e.target.value)} />
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Asignación</label>
                      <input type="date" className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 bg-slate-50" value={row.createdAt} onChange={(e) => updateRow(row.id, 'createdAt', e.target.value)} />
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1">Deadline</label>
                      <input type="date" className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 bg-indigo-50/30" value={row.assistantDeadline} onChange={(e) => updateRow(row.id, 'assistantDeadline', e.target.value)} />
                    </div>

                    <div className="w-full sm:w-40">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Responsable</label>
                      <select className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white" value={row.assignedTo} onChange={(e) => updateRow(row.id, 'assignedTo', e.target.value)}>
                        <option value="">-- Sin Asignar --</option>
                        {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-1 mb-0.5">
                      <button 
                        type="button" 
                        onClick={() => updateRow(row.id, 'showCommentField', !row.showCommentField)}
                        className={`p-2 rounded-lg transition-colors ${row.showCommentField || row.comment ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-500'}`}
                        title="Agregar aclaración"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => removeRow(row.id)} disabled={taskRows.length === 1} className="p-2 text-slate-300 hover:text-red-500 rounded-lg disabled:opacity-30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CAMPO DE ACLARACIÓN DESPLEGABLE */}
                  {(row.showCommentField || row.comment) && (
                    <div className="mt-3 ml-0 sm:ml-9 animate-fade-in">
                      <input 
                        type="text"
                        placeholder="Escribe aquí una aclaración o comentario para este renglón..."
                        className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg p-2 text-xs text-indigo-900 placeholder:text-indigo-300 outline-none focus:border-indigo-300"
                        value={row.comment}
                        onChange={(e) => updateRow(row.id, 'comment', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="w-3/4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-sm">{loading ? 'Guardando...' : `Guardar Trámite`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}