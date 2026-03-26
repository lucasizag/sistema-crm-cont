import { useEffect, useState } from 'react';
import { X, Plus, Trash2, ListChecks } from 'lucide-react';
import api from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId?: string; 
  taskToEdit?: any;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess, clientId: propClientId }: Props) {
  const [generalTitle, setGeneralTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  
  // Función para crear un renglón limpio (con la fecha de hoy por defecto)
  const createEmptyRow = () => ({
    id: Date.now(),
    title: '',
    assignedTo: '',
    createdAt: new Date().toISOString().split('T')[0], // Hoy por defecto
    assistantDeadline: '',
    dueDate: '',
  });

  const [taskRows, setTaskRows] = useState([createEmptyRow()]);

  const [clients, setClients] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeneralTitle('');
      setDescription('');
      setClientId(propClientId || ''); 
      setTaskRows([createEmptyRow()]);
      fetchDropdownData();
    }
  }, [isOpen, propClientId]); 

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, assistantsRes] = await Promise.all([
        api.get('/client'),
        api.get('/user')
      ]);
      setClients(clientsRes.data);
      setAssistants(assistantsRes.data);
    } catch (error) {
      console.error("Error cargando listas:", error);
    }
  };

  const addRow = () => setTaskRows([...taskRows, createEmptyRow()]);

  const removeRow = (idToRemove: number) => {
    if (taskRows.length > 1) {
      setTaskRows(taskRows.filter(row => row.id !== idToRemove));
    }
  };

  const updateRow = (id: number, field: string, value: string) => {
    setTaskRows(taskRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = taskRows.map(row => {
        let finalTitle = 'Tarea sin título';
        if (generalTitle && row.title) finalTitle = `${generalTitle} - ${row.title}`;
        else if (generalTitle) finalTitle = generalTitle;
        else if (row.title) finalTitle = row.title;

        // Mandamos la nueva fecha (createdAt) y quitamos la condición
        return api.post('/task', {
          title: finalTitle,
          description: description || null,
          clientId: clientId || null,
          assignedToId: row.assignedTo || null,
          createdAt: row.createdAt || null, 
          dueDate: row.dueDate || null,
          assistantDeadline: row.assistantDeadline || null
        });
      });

      await Promise.all(promises);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar las tareas.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cargar Tareas / Trámite</h2>
            <p className="text-sm text-slate-500">Agrupa varias acciones para un cliente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título General (Trámite)</label>
                <input 
                  type="text" placeholder="Ej: Liquidación IVA" 
                  className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                  value={generalTitle} onChange={(e) => setGeneralTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente Asociado</label>
                <select 
                  disabled={!!propClientId} 
                  className={`block w-full rounded-xl border p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors ${
                    propClientId ? 'bg-slate-200 border-slate-300 text-slate-700 font-bold cursor-not-allowed opacity-100' : 'bg-white border-slate-200'
                  }`}
                  value={clientId} 
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">-- Sin Cliente Específico --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción / Notas</label>
              <textarea 
                rows={2} placeholder="Detalles que aplican a todas las tareas..."
                className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                value={description} onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-800">Tareas Específicas a realizar</label>
              <button 
                type="button" onClick={addRow}
                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Agregar renglón
              </button>
            </div>

            <div className="space-y-4">
              {taskRows.map((row, index) => (
                <div key={row.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-white p-4 sm:p-2 rounded-xl border border-slate-200 group">
                  
                  <span className="w-6 text-center text-slate-400 font-medium text-sm hidden sm:block mb-2.5">
                    {index + 1}.
                  </span>
                  
                  {/* TAREA */}
                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nombre Tarea</label>
                    <input 
                      type="text" placeholder="Ej: Cargar comprobantes"
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none"
                      value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                    />
                  </div>
                  
                  {/* NUEVO: ASIGNACION */}
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Asignación</label>
                    <input 
                      type="date"
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:border-indigo-500 outline-none bg-slate-50"
                      value={row.createdAt} onChange={(e) => updateRow(row.id, 'createdAt', e.target.value)}
                    />
                  </div>

                  {/* DEADLINE ASISTENTE */}
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1">Deadline Asist.</label>
                    <input 
                      type="date"
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:border-indigo-500 outline-none bg-indigo-50/30"
                      value={row.assistantDeadline} onChange={(e) => updateRow(row.id, 'assistantDeadline', e.target.value)}
                    />
                  </div>

                  {/* VENCIMIENTO (antes Venc. Estudio) */}
                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-red-500 uppercase mb-1 ml-1">Vencimiento</label>
                    <input 
                      type="date"
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:border-indigo-500 outline-none"
                      value={row.dueDate} onChange={(e) => updateRow(row.id, 'dueDate', e.target.value)}
                    />
                  </div>

                  {/* RESPONSABLE */}
                  <div className="w-full sm:w-40">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Responsable</label>
                    <select 
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none"
                      value={row.assignedTo} onChange={(e) => updateRow(row.id, 'assignedTo', e.target.value)}
                    >
                      <option value="">-- Sin Asignar --</option>
                      {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>

                  <button 
                    type="button" onClick={() => removeRow(row.id)} disabled={taskRows.length === 1}
                    className="p-2 text-slate-300 hover:text-red-500 rounded-lg disabled:opacity-30 transition mb-0.5"
                    title="Eliminar renglón"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="w-3/4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium text-sm flex justify-center shadow-sm">
              {loading ? 'Guardando...' : `Guardar ${taskRows.length} Tarea(s)`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}