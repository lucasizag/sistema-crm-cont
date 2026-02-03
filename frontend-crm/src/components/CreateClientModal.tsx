import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
  clientToEdit?: ClientData | null; // <--- NUEVO: Puede venir un cliente o ser null
}

export default function CreateClientModal({ isOpen, onClose, onSuccess, clientToEdit }: Props) {
  const [formData, setFormData] = useState<ClientData>({
    name: '',
    cuit: '',
    taxType: 'Monotributista'
  });
  const [loading, setLoading] = useState(false);

  // EFECTO: Cuando se abre el modal, decidimos si llenamos el formulario o lo limpiamos
  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        // MODO EDICION: Rellenamos con los datos existentes
        setFormData({
          name: clientToEdit.name,
          cuit: clientToEdit.cuit,
          taxType: clientToEdit.taxType
        });
      } else {
        // MODO CREACION: Limpiamos todo
        setFormData({ name: '', cuit: '', taxType: 'Monotributista' });
      }
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (clientToEdit && clientToEdit.id) {
        // --- LOGICA DE ACTUALIZAR (PATCH) ---
        await api.patch(`/client/${clientToEdit.id}`, formData);
      } else {
        // --- LOGICA DE CREAR (POST) ---
        await api.post('/client', formData);
      }
      
      onSuccess(); // Recargar lista
      onClose();   // Cerrar modal
    } catch (error) {
      alert('Error guardando cliente. Revisa la consola.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        {/* El título cambia dinámicamente */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CUIT</label>
            <input
              type="text"
              required
              placeholder="20-12345678-9"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
              value={formData.cuit}
              onChange={(e) => setFormData({...formData, cuit: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Condición Fiscal</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
              value={formData.taxType}
              onChange={(e) => setFormData({...formData, taxType: e.target.value})}
            >
              <option>Monotributista</option>
              <option>Resp. Inscripto</option>
              <option>Exento</option>
              <option>Consumidor Final</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition disabled:bg-blue-300"
          >
            {loading ? 'Guardando...' : (clientToEdit ? 'Actualizar Cliente' : 'Guardar Cliente')}
          </button>
        </form>
      </div>
    </div>
  );
}