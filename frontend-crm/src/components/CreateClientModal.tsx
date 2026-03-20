import { useEffect, useState } from 'react';
import { X, UserPlus, UserCog } from 'lucide-react';
import api from '../api';

// Definimos cómo se ve un Cliente
interface ClientData {
  id?: string;
  name: string;
  cuit: string;
  taxType: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientToEdit?: ClientData | null;
}

export default function CreateClientModal({ isOpen, onClose, onSuccess, clientToEdit }: Props) {
  const [formData, setFormData] = useState<ClientData>({
    name: '',
    cuit: '',
    taxType: 'Monotributista'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // EFECTO CORRECTO: Sincroniza los datos cada vez que cambia el estado del modal o el cliente a editar
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(''); // Limpiamos errores anteriores
      if (clientToEdit) {
        // MODO EDICIÓN
        setFormData({
          name: clientToEdit.name || '',
          cuit: clientToEdit.cuit || '',
          taxType: clientToEdit.taxType || 'Monotributista'
        });
      } else {
        // MODO CREACIÓN
        setFormData({ name: '', cuit: '', taxType: 'Monotributista' });
      }
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (clientToEdit && clientToEdit.id) {
        // ACTUALIZAR (PATCH)
        await api.patch(`/client/${clientToEdit.id}`, formData);
      } else {
        // CREAR (POST)
        await api.post('/client', formData);
      }
      
      onSuccess(); // Recarga la lista
      onClose();   // Cierra el modal
    } catch (error: any) {
      console.error(error);
      // Mostramos un error más amigable si el CUIT ya existe
      if (error.response?.data?.message?.includes('ya existe') || error.response?.status === 409 || error.response?.data?.message?.includes('Unique constraint')) {
         setErrorMsg('Ya existe un cliente registrado con este CUIT.');
      } else {
         setErrorMsg('Ocurrió un error al guardar. Revisa los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative transform transition-all">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Modal */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            {clientToEdit ? <UserCog className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-sm text-slate-500">
              {clientToEdit ? 'Actualiza los datos fiscales.' : 'Ingresa los datos para registrarlo.'}
            </p>
          </div>
        </div>

        {/* Mensaje de Error (si ocurre) */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-start gap-2">
            <span className="mt-0.5 text-lg leading-none">⚠️</span>
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre / Razón Social</label>
            <input
              type="text"
              required
              placeholder="Ej: Juan Pérez o Empresa S.A."
              className="block w-full rounded-xl border-slate-200 shadow-sm border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">CUIT</label>
            <input
              type="text"
              required
              placeholder="Ej: 20351228068 (Solo números)"
              className="block w-full rounded-xl border-slate-200 shadow-sm border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm font-mono"
              value={formData.cuit}
              onChange={(e) => setFormData({...formData, cuit: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Condición Fiscal</label>
            <select
              className="block w-full rounded-xl border-slate-200 shadow-sm border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm cursor-pointer"
              value={formData.taxType}
              onChange={(e) => setFormData({...formData, taxType: e.target.value})}
            >
              <option value="Monotributista">Monotributista</option>
              <option value="Resp. Inscripto">Resp. Inscripto</option>
              <option value="Exento">Exento</option>
              <option value="Consumidor Final">Consumidor Final</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-white text-slate-600 border border-slate-200 py-3 px-4 rounded-xl hover:bg-slate-50 font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm disabled:bg-indigo-300 disabled:cursor-not-allowed text-sm flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                clientToEdit ? 'Guardar Cambios' : 'Registrar Cliente'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}