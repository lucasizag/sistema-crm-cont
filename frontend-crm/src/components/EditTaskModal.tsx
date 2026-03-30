import { useEffect, useState } from 'react';
import { X, PencilLine } from 'lucide-react';
import api from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: any;
}

export default function EditTaskModal({ isOpen, onClose, onSuccess, task }: Props) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    createdAt: '',
    assistantDeadline: '',
    dueDate: '',
    assignedToId: ''
  });

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        clientId: task.client?.id || '',
        createdAt: task.createdAt ? task.createdAt.split('T')[0] : '', 
        assistantDeadline: task.assistantDeadline ? task.assistantDeadline.split('T')[0] : '', 
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', 
        assignedToId: task.assignedTo?.id || ''
      });
      fetchDropdownData();
    }
  }, [isOpen, task]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        clientId: formData.clientId || null,
        assignedToId: formData.assignedToId || null,
        createdAt: formData.createdAt || null,
        assistantDeadline: formData.assistantDeadline || null,
        dueDate: formData.dueDate || null,
      };

      await api.patch(`/task/${task.id}`, payload);
      onSuccess();
      onClose(); // Me di cuenta de que faltaba cerrar el modal al terminar, ¡ahora se cierra solo!
    } catch (error) {
      console.error(error);
      alert('Hubo un error al actualizar la tarea.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Igualamos el max-w-5xl para que tenga el mismo ancho que el de Crear */}
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <PencilLine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Editar Tarea</h2>
            <p className="text-sm text-slate-500">Modifica los detalles, fechas o reasigna el trabajo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BLOQUE SUPERIOR: Igual al diseño de Crear */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título de la Tarea</label>
                <input 
                  type="text" required
                  placeholder="Ej: Liquidación IVA" 
                  className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente Asociado</label>
                <select 
                  className="block w-full rounded-xl border p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors bg-white border-slate-200"
                  value={formData.clientId} 
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">-- Sin Cliente Específico --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción / Notas</label>
              <textarea 
                rows={2} placeholder="Detalles de la tarea..."
                className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* BLOQUE INFERIOR: Simulando el renglón de fechas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-800">Fechas y Asignación</label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-white p-4 sm:p-2 rounded-xl border border-slate-200 group">
                
                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Asignación</label>
                  <input 
                    type="date"
                    className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:border-indigo-500 outline-none bg-slate-50"
                    value={formData.createdAt} onChange={(e) => setFormData({...formData, createdAt: e.target.value})}
                  />
                </div>

                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1 ml-1">Deadline Asist.</label>
                  <input 
                    type="date"
                    className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:border-indigo-500 outline-none bg-indigo-50/30"
                    value={formData.assistantDeadline} onChange={(e) => setFormData({...formData, assistantDeadline: e.target.value})}
                  />
                </div>

                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] font-bold text-red-500 uppercase mb-1 ml-1">Vencimiento</label>
                  <input 
                    type="date"
                    className="w-full rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:border-indigo-500 outline-none"
                    value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div className="w-full sm:flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Responsable</label>
                  <select 
                    className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none"
                    value={formData.assignedToId} onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
                  >
                    <option value="">-- Sin Asignar --</option>
                    {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="w-3/4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium text-sm flex justify-center shadow-sm">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}