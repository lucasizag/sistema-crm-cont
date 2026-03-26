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
    dueDate: '',
    assistantDeadline: '', // NUEVO: Deadline interno
    condition: 'Predeterminada',
    clientId: '',
    assignedToId: ''
  });

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', 
        assistantDeadline: task.assistantDeadline ? task.assistantDeadline.split('T')[0] : '', 
        condition: task.condition || 'Predeterminada',
        clientId: task.client?.id || '',
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
      // Limpiamos los datos: si las fechas o IDs están vacíos, mandamos null
      const payload = {
        ...formData,
        dueDate: formData.dueDate || null,
        assistantDeadline: formData.assistantDeadline || null,
        clientId: formData.clientId || null,
        assignedToId: formData.assignedToId || null,
      };

      await api.patch(`/task/${task.id}`, payload);
      onSuccess();
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
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
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

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Título de la Tarea</label>
            <input 
              type="text" required
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none"
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea 
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente Asociado</label>
              <select 
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none bg-white"
                value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">-- Sin Cliente (General) --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Asignar a Asistente</label>
              <select 
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none bg-white"
                value={formData.assignedToId} onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}
              >
                <option value="">-- Sin Asignar --</option>
                {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {/* GRILLA DE FECHAS Y CONDICIÓN (SIN HORAS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vencimiento Estudio</label>
              <input 
                type="date"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none text-slate-600"
                value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline Asistente</label>
              <input 
                type="date"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none bg-indigo-50/50 text-slate-600"
                value={formData.assistantDeadline} onChange={(e) => setFormData({...formData, assistantDeadline: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Condición</label>
              <select 
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium focus:border-indigo-500 outline-none text-slate-600"
                value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                <option value="Predeterminada">Estándar</option>
                <option value="Especial">Especial ⭐</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-sm transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="w-3/4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium text-sm flex justify-center transition shadow-sm">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}