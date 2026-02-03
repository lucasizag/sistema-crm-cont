import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../api';

// Definimos la estructura de la tarea que recibimos para editar
interface TaskData {
  id?: string;
  title: string;
  description?: string;
  dueDate: string;
  assignedTo?: { id: string; name: string } | null;
  // --- NUEVOS CAMPOS ---
  estimatedHours?: number;
  actualHours?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  taskToEdit?: TaskData | null;
}

interface User {
  id: string;
  name: string;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess, clientId, taskToEdit }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    userId: '',
    // --- NUEVOS ESTADOS ---
    estimatedHours: 0,
    actualHours: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargamos usuarios al montar el componente
  useEffect(() => {
    if (isOpen) {
      api.get('/user').then(res => setUsers(res.data)).catch(console.error);
    }
  }, [isOpen]);

  // EFECTO: Decidir si rellenamos el form o lo limpiamos
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        // --- MODO EDICION ---
        const formattedDate = taskToEdit.dueDate ? taskToEdit.dueDate.toString().split('T')[0] : '';
        
        setFormData({
          title: taskToEdit.title,
          description: taskToEdit.description || '',
          dueDate: formattedDate,
          userId: taskToEdit.assignedTo ? taskToEdit.assignedTo.id : '',
          // Cargar horas o poner 0 si no existen
          estimatedHours: taskToEdit.estimatedHours || 0,
          actualHours: taskToEdit.actualHours || 0
        });
      } else {
        // --- MODO CREACION ---
        setFormData({ 
          title: '', 
          description: '', 
          dueDate: '', 
          userId: '',
          estimatedHours: 0,
          actualHours: 0
        });
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Preparamos los datos
      const payload = {
        ...formData,
        clientId: clientId,
        userId: formData.userId === '' ? undefined : formData.userId,
        // Aseguramos que sean números
        estimatedHours: Number(formData.estimatedHours),
        actualHours: Number(formData.actualHours)
      };

      if (taskToEdit && taskToEdit.id) {
        // ACTUALIZAR (PATCH)
        await api.patch(`/task/${taskToEdit.id}`, payload);
      } else {
        // CREAR (POST)
        await api.post('/task', payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert('Error guardando tarea');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              required
              placeholder="Ej: Liquidación IIBB"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Asignar a</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white focus:border-blue-500 focus:ring-blue-500"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
              >
                <option value="">-- Sin asignar --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          {/* --- NUEVA SECCIÓN DE HORAS --- */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">⏳ Presupuestadas</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full border-gray-300 rounded p-1.5 text-sm focus:border-blue-500 focus:ring-blue-500 border"
                placeholder="0.0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">⏱️ Reales (Final)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full border-yellow-300 bg-yellow-50 rounded p-1.5 text-sm focus:border-yellow-500 focus:ring-yellow-500 border"
                placeholder="0.0"
                value={formData.actualHours}
                onChange={(e) => setFormData({...formData, actualHours: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition disabled:bg-blue-300 mt-4"
          >
            {loading ? 'Guardando...' : (taskToEdit ? 'Actualizar Tarea' : 'Agendar Tarea')}
          </button>
        </form>
      </div>
    </div>
  );
}