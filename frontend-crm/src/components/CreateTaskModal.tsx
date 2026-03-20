import { useEffect, useState } from 'react';
import { X, Plus, Trash2, ListChecks } from 'lucide-react';
import api from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: Props) {
  // Datos Generales
  const [generalTitle, setGeneralTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  
  // Renglones de Tareas (Empezamos con 1 renglón vacío)
  const [taskRows, setTaskRows] = useState([
    { id: Date.now(), title: '', assignedTo: '' }
  ]);

  // Listas para los desplegables
  const [clients, setClients] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Limpiamos el formulario al abrir
      setGeneralTitle('');
      setDescription('');
      setClientId('');
      setTaskRows([{ id: Date.now(), title: '', assignedTo: '' }]);
      
      // Cargamos clientes y asistentes para los selectores
      fetchDropdownData();
    }
  }, [isOpen]);

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

  // Funciones para manejar los renglones dinámicos
  const addRow = () => {
    setTaskRows([...taskRows, { id: Date.now(), title: '', assignedTo: '' }]);
  };

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

  // Guardar todo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Por cada renglón, creamos una tarea en el backend
      const promises = taskRows.map(row => {
        // Armamos el título final: "Título General - Tarea Específica"
        const finalTitle = generalTitle ? `${generalTitle} - ${row.title}` : row.title;

        return api.post('/task', {
          title: finalTitle,
          description: description,
          clientId: clientId || null, // Se lo asignamos al cliente seleccionado
          assignedToId: row.assignedTo || null // Se lo asignamos al asistente (OJO: Asegúrate que tu backend espere 'assignedToId')
        });
      });

      // Esperamos a que se guarden todos los renglones
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
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cargar Tareas / Trámite</h2>
            <p className="text-sm text-slate-500">Agrupa varias acciones bajo un mismo trámite general.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título General (Trámite)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Liquidación Mensual Mayo" 
                  className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                  value={generalTitle} onChange={(e) => setGeneralTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente Asociado</label>
                <select 
                  required
                  className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                  value={clientId} onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción / Notas (Opcional)</label>
              <textarea 
                rows={2}
                placeholder="Detalles que aplican a todas las tareas..."
                className="block w-full rounded-xl border-slate-200 border p-2.5 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                value={description} onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* SECCIÓN 2: RENGLONES DE TAREAS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-800">Tareas Específicas</label>
              <button 
                type="button" 
                onClick={addRow}
                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Agregar renglón
              </button>
            </div>

            <div className="space-y-3">
              {taskRows.map((row, index) => (
                <div key={row.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-2 rounded-xl border border-slate-200 group">
                  
                  <span className="w-6 text-center text-slate-400 font-medium text-sm hidden sm:block">
                    {index + 1}.
                  </span>
                  
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Presentar DDJJ" 
                    className="flex-1 rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    value={row.title} 
                    onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                  />
                  
                  <select 
                    required
                    className="w-full sm:w-48 rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    value={row.assignedTo} 
                    onChange={(e) => updateRow(row.id, 'assignedTo', e.target.value)}
                  >
                    <option value="">-- Asignar a --</option>
                    {assistants.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>

                  <button 
                    type="button" 
                    onClick={() => removeRow(row.id)}
                    disabled={taskRows.length === 1}
                    className="p-2 text-slate-300 hover:text-red-500 rounded-lg disabled:opacity-30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BOTONES FINALES */}
          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="w-3/4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium text-sm flex justify-center">
              {loading ? 'Generando tareas...' : `Guardar ${taskRows.length} Tarea(s)`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}