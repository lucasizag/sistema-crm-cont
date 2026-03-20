import { useEffect, useState } from 'react';
import { X, UserPlus, UserCog } from 'lucide-react';
import api from '../api';

interface AssistantData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assistantToEdit?: AssistantData | null;
}

export default function CreateAssistantModal({ isOpen, onClose, onSuccess, assistantToEdit }: Props) {
  const [formData, setFormData] = useState<AssistantData>({
    name: '',
    email: '',
    password: '',
    role: 'assistant'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (assistantToEdit) {
        setFormData({
          name: assistantToEdit.name || '',
          email: assistantToEdit.email || '',
          password: '', // La contraseña la dejamos vacía por seguridad al editar
          role: assistantToEdit.role || 'assistant'
        });
      } else {
        setFormData({ name: '', email: '', password: '', role: 'assistant' });
      }
    }
  }, [isOpen, assistantToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Si estamos editando y no escribió contraseña nueva, la quitamos del envío
      const dataToSend = { ...formData };
      if (assistantToEdit && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (assistantToEdit && assistantToEdit.id) {
        await api.patch(`/user/${assistantToEdit.id}`, dataToSend); // Asumimos que la ruta es /user
      } else {
        await api.post('/user', dataToSend);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Error al guardar. Verifica que el email no esté repetido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            {assistantToEdit ? <UserCog className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{assistantToEdit ? 'Editar Asistente' : 'Nuevo Asistente'}</h2>
            <p className="text-sm text-slate-500">Credenciales de acceso al sistema.</p>
          </div>
        </div>

        {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input type="text" required className="block w-full rounded-xl border-slate-200 border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email (Usuario)</label>
            <input type="email" required className="block w-full rounded-xl border-slate-200 border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña {assistantToEdit && <span className="text-slate-400 font-normal">(Opcional si no la cambias)</span>}</label>
            <input type={assistantToEdit ? "password" : "text"} required={!assistantToEdit} placeholder="Ej: temporal123" className="block w-full rounded-xl border-slate-200 border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Rol en el sistema</label>
            <select className="block w-full rounded-xl border-slate-200 border p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 text-sm" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="assistant">Asistente (Solo ve sus tareas)</option>
              <option value="admin">Administrador (Acceso total)</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/3 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 font-medium text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="w-2/3 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium text-sm flex justify-center">
              {loading ? 'Guardando...' : (assistantToEdit ? 'Guardar Cambios' : 'Registrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}