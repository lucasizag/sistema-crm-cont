import { useEffect, useState } from 'react';
import { X, Building2, Plus, Trash2, ListChecks } from 'lucide-react'; 
import api from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientToEdit?: any;
}

const PREDEFINED_TAX_TYPES = [
  'Responsable Inscripto',
  'Monotributista',
  'Exento',
  'Consumidor Final'
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CreateClientModal({ isOpen, onClose, onSuccess, clientToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    address: '',
    email: '',
    phone: '',
    startDate: today, 
    closeMonth: '', 
    dropDate: '',   
  });

  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [customTaxType, setCustomTaxType] = useState('');

  // ESTADO PARA LAS TAREAS PREDETERMINADAS
  const createEmptyPtRow = () => ({ id: Date.now(), task: '', month: '', observations: '' });
  const [ptRows, setPtRows] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setFormData({
          name: clientToEdit.name || '',
          cuit: clientToEdit.cuit || '',
          address: clientToEdit.address || '',
          email: clientToEdit.email || '',
          phone: clientToEdit.phone || '',
          startDate: clientToEdit.startDate ? clientToEdit.startDate.split('T')[0] : '',
          closeMonth: clientToEdit.closeMonth || '',
          dropDate: clientToEdit.dropDate ? clientToEdit.dropDate.split('T')[0] : '',
        });

        const existingTaxType = clientToEdit.taxType;
        if (!existingTaxType) {
          setSelectedDropdown('');
          setCustomTaxType('');
        } else if (PREDEFINED_TAX_TYPES.includes(existingTaxType)) {
          setSelectedDropdown(existingTaxType);
          setCustomTaxType('');
        } else {
          setSelectedDropdown('Otro');
          setCustomTaxType(existingTaxType);
        }

        // Cargar tareas predeterminadas existentes
        if (clientToEdit.predeterminedTasks && clientToEdit.predeterminedTasks.length > 0) {
          setPtRows(clientToEdit.predeterminedTasks.map((pt: any, i: number) => ({ ...pt, id: Date.now() + i })));
        } else {
          setPtRows([createEmptyPtRow()]); // Un renglón vacío por defecto
        }

      } else {
        setFormData({ name: '', cuit: '', address: '', email: '', phone: '', startDate: today, closeMonth: '', dropDate: '' });
        setSelectedDropdown('');
        setCustomTaxType('');
        setPtRows([createEmptyPtRow()]);
      }
    }
  }, [isOpen, clientToEdit, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalTaxType = null;
    if (selectedDropdown === 'Otro') {
      finalTaxType = customTaxType.trim() || null;
    } else if (selectedDropdown) {
      finalTaxType = selectedDropdown;
    }

    // Filtramos los renglones vacíos para no guardar basura en la base de datos
    const validPtRows = ptRows.filter(r => r.task.trim() !== '').map(({ id, ...rest }) => rest);

    const payload = {
      ...formData,
      taxType: finalTaxType,
      startDate: formData.startDate || null,
      closeMonth: formData.closeMonth || null,
      dropDate: formData.dropDate || null,
      predeterminedTasks: validPtRows.length > 0 ? validPtRows : null,
    };

    try {
      if (clientToEdit) {
        await api.patch(`/client/${clientToEdit.id}`, payload);
      } else {
        await api.post('/client', payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FUNCIONES PARA TAREAS PREDETERMINADAS
  const addPtRow = () => setPtRows([...ptRows, createEmptyPtRow()]);
  const removePtRow = (id: number) => setPtRows(ptRows.filter(r => r.id !== id));
  const updatePtRow = (id: number, field: string, value: string) => {
    setPtRows(ptRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 border border-indigo-100 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {clientToEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            <p className="text-sm text-slate-500">Completa la información legal y de contacto.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- INFORMACIÓN BÁSICA --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre / Razón Social</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none" placeholder="Ej: Juan Pérez S.A." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">CUIT</label>
              <input type="text" name="cuit" value={formData.cuit} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none font-mono" placeholder="Ej: 20-33444555-9" />
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Condición Fiscal <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <select
                  value={selectedDropdown}
                  onChange={(e) => setSelectedDropdown(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributista">Monotributista</option>
                  <option value="Exento">Exento</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {selectedDropdown === 'Otro' && (
                <div className="animate-fade-in-down">
                  <label className="block text-sm font-semibold text-indigo-700 mb-1.5">Especificar otra condición</label>
                  <input
                    type="text" value={customTaxType} onChange={(e) => setCustomTaxType(e.target.value)} placeholder="Ej: Monotributista Social..."
                    className="w-full rounded-xl border border-indigo-200 p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none" placeholder="ejemplo@correo.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono de Contacto</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none font-mono" placeholder="Ej: 11 4455-6677" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Domicilio Fiscal / Comercial</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none" placeholder="Calle 123, Ciudad, Provincia" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100 mt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha de Alta</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none text-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mes de Cierre <span className="text-slate-400 font-normal">(Ejerc.)</span></label>
              <select name="closeMonth" value={formData.closeMonth} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none bg-white text-slate-600 font-medium">
                <option value="">-- Elegir Mes --</option>
                {MONTHS.map(mes => <option key={mes} value={mes}>{mes}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha de Baja <span className="text-slate-400 font-normal">(Cese)</span></label>
              <input type="date" name="dropDate" value={formData.dropDate} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 outline-none text-slate-600" />
            </div>
          </div>

          {/* --- NUEVA SECCIÓN: TAREAS PREDETERMINADAS --- */}
          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-indigo-600" /> 
                  Tareas Predeterminadas <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                </label>
                <p className="text-[11px] text-slate-500">Obligaciones recurrentes que tiene este cliente.</p>
              </div>
              <button type="button" onClick={addPtRow} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                <Plus className="w-3.5 h-3.5" /> Agregar renglón
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {ptRows.map((row, index) => (
                <div key={row.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-white p-3 rounded-xl border border-slate-200">
                  <span className="w-6 text-center text-slate-400 font-bold text-sm hidden sm:block mb-2">
                    {index + 1}.
                  </span>
                  
                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Tarea / Obligación</label>
                    <input 
                      type="text" placeholder="Ej: DDJJ IVA"
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none"
                      value={row.task} onChange={(e) => updatePtRow(row.id, 'task', e.target.value)}
                    />
                  </div>

                  <div className="w-full sm:w-40">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Mes Vencimiento</label>
                    <select 
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none bg-white text-slate-600"
                      value={row.month} onChange={(e) => updatePtRow(row.id, 'month', e.target.value)}
                    >
                      <option value="">-- Ninguno --</option>
                      {MONTHS.map(mes => <option key={mes} value={mes}>{mes}</option>)}
                      <option value="Todos los meses">Todos los meses</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-48">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Observaciones</label>
                    <input 
                      type="text" placeholder="Ej: Presentar antes del 15"
                      className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:border-indigo-500 outline-none"
                      value={row.observations} onChange={(e) => updatePtRow(row.id, 'observations', e.target.value)}
                    />
                  </div>

                  <button 
                    type="button" onClick={() => removePtRow(row.id)}
                    className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition mb-0.5" title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {ptRows.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">No hay tareas predeterminadas. Presiona "Agregar renglón" para crear una.</p>
              )}
            </div>
          </div>

          <div className="pt-6 flex gap-4 border-t border-slate-100 mt-8">
            <button type="button" onClick={onClose} className="w-full md:w-auto md:px-8 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-slate-700 text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="w-full md:flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-semibold text-sm flex justify-center items-center shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Guardando...' : (clientToEdit ? 'Actualizar Cliente' : 'Registrar Cliente')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}