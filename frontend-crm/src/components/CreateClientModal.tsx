import { useEffect, useState } from 'react';
import { X, Building2 } from 'lucide-react'; 
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

export default function CreateClientModal({ isOpen, onClose, onSuccess, clientToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Obtenemos la fecha de hoy en formato YYYY-MM-DD para el valor por defecto
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    address: '',
    email: '',
    phone: '',
    startDate: today, // Por defecto hoy
    closeDate: '',
  });

  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [customTaxType, setCustomTaxType] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setFormData({
          name: clientToEdit.name || '',
          cuit: clientToEdit.cuit || '',
          address: clientToEdit.address || '',
          email: clientToEdit.email || '',
          phone: clientToEdit.phone || '',
          // Si ya tiene fecha, la cargamos (cortamos la hora por si viene con formato largo)
          startDate: clientToEdit.startDate ? clientToEdit.startDate.split('T')[0] : '',
          closeDate: clientToEdit.closeDate ? clientToEdit.closeDate.split('T')[0] : '',
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
      } else {
        // Nuevo cliente
        setFormData({ name: '', cuit: '', address: '', email: '', phone: '', startDate: today, closeDate: '' });
        setSelectedDropdown('');
        setCustomTaxType('');
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

    // Armamos el paquete incluyendo las fechas nuevas (si están vacías, mandamos null)
    const payload = {
      ...formData,
      taxType: finalTaxType,
      startDate: formData.startDate || null,
      closeDate: formData.closeDate || null,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre / Razón Social</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="input-field" placeholder="Ej: Juan Pérez S.A." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">CUIT</label>
              <input type="text" name="cuit" value={formData.cuit} onChange={handleInputChange} className="input-field font-mono" placeholder="Ej: 20-33444555-9" />
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
                  className="input-field bg-white"
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
                  <label className="block text-sm font-semibold text-indigo-700 mb-1.5">
                    Especificar otra condición
                  </label>
                  <input
                    type="text"
                    value={customTaxType}
                    onChange={(e) => setCustomTaxType(e.target.value)}
                    placeholder="Ej: Monotributista Social..."
                    className="input-field border-indigo-200 focus:border-indigo-500 focus:ring-indigo-100 bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="ejemplo@correo.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono de Contacto</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field font-mono" placeholder="Ej: 11 4455-6677" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Domicilio Fiscal / Comercial</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-field" placeholder="Calle 123, Ciudad, Provincia" />
          </div>

          {/* --- NUEVA SECCIÓN: FECHAS IMPORTANTES --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Fecha de Alta
              </label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleInputChange} 
                className="input-field text-slate-600" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Fecha de Cierre / Cese <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input 
                type="date" 
                name="closeDate" 
                value={formData.closeDate} 
                onChange={handleInputChange} 
                className="input-field text-slate-600" 
              />
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