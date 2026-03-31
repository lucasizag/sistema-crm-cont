import { useEffect, useState } from 'react';
import { X, Clock, Plus, Trash2 } from 'lucide-react';
import api from '../api';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function EditHoursModal({ isOpen, onClose, onSuccess, parentTask, subTaskId }: any) {
  const [loading, setLoading] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [incurredRows, setIncurredRows] = useState<any[]>([]);
  const [subTaskTitle, setSubTaskTitle] = useState('');

  useEffect(() => {
    if (isOpen && parentTask && subTaskId) {
      const subTask = parentTask.subTasks?.find((st: any) => st.id === subTaskId);
      if (subTask) {
        setSubTaskTitle(subTask.title);
        setEstimatedHours(subTask.estimatedHours || '');
        if (subTask.incurredHoursData && subTask.incurredHoursData.length > 0) {
          setIncurredRows(subTask.incurredHoursData.map((row: any, i: number) => ({ ...row, _uuid: Date.now() + i })));
        } else {
          setIncurredRows([]);
        }
      }
    }
  }, [isOpen, parentTask, subTaskId]);

  const addRow = () => setIncurredRows([...incurredRows, { _uuid: Date.now(), month: '', hours: '' }]);
  const removeRow = (id: number) => setIncurredRows(incurredRows.filter(r => r._uuid !== id));
  const updateRow = (id: number, field: string, value: string) => {
    setIncurredRows(incurredRows.map(r => r._uuid === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validRows = incurredRows.filter(r => r.month !== '' && r.hours !== '').map(({ _uuid, ...rest }) => rest);

      // Buscamos el sub-renglón y le inyectamos las horas nuevas
      const updatedSubTasks = parentTask.subTasks.map((st: any) => {
        if (st.id === subTaskId) {
          return { ...st, estimatedHours: estimatedHours || null, incurredHoursData: validRows };
        }
        return st;
      });

      await api.patch(`/task/${parentTask.id}`, { subTasks: updatedSubTasks });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Error al guardar las horas.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !parentTask) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600 border border-amber-100"><Clock className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Auditoría de Horas</h2>
            <p className="text-sm text-slate-500 font-medium">Sub-tarea: {subTaskTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">Horas Estimadas (Total para este renglón)</label>
            <input type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="w-1/2 rounded-xl border-slate-200 border p-2.5 bg-white focus:border-amber-500 outline-none font-bold text-slate-700" placeholder="Ej: 10.5" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-800">Registro de Horas Incurridas</label>
              <button type="button" onClick={addRow} className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Agregar registro</button>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {incurredRows.map((row) => (
                <div key={row._uuid} className="flex gap-3 items-end bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Mes</label>
                    <select value={row.month} onChange={(e) => updateRow(row._uuid, 'month', e.target.value)} className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-amber-500 outline-none bg-white">
                      <option value="">-- Seleccionar --</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Horas gastadas</label>
                    <input type="number" step="0.5" value={row.hours} onChange={(e) => updateRow(row._uuid, 'hours', e.target.value)} className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-amber-500 outline-none font-bold text-slate-600" placeholder="Ej: 2.5" />
                  </div>
                  <button type="button" onClick={() => removeRow(row._uuid)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg mb-0.5"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {incurredRows.length === 0 && <p className="text-center text-slate-400 text-xs py-2">No hay horas incurridas registradas aún.</p>}
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-1/4 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="w-3/4 bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 font-bold text-sm shadow-sm">Guardar Horas</button>
          </div>
        </form>
      </div>
    </div>
  );
}