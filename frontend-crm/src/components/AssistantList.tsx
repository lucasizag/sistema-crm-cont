import { useEffect, useState } from 'react';
import { Pencil, Trash2, Search, X } from 'lucide-react';
import api from '../api';
import CreateAssistantModal from './CreateAssistantModal';

export default function AssistantList() {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/user'); // Asumimos ruta /user
      setAssistants(response.data);
    } catch (error) {
      console.error("Error cargando asistentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el acceso de "${name}"?`)) {
      try {
        await api.delete(`/user/${id}`);
        fetchAssistants();
      } catch (error) {
        alert("Error al eliminar. Revisa la consola.");
      }
    }
  };

  const filteredAssistants = assistants.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Buscar por nombre o email..." className="block w-full pl-10 py-2 border rounded-xl bg-slate-50 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setEditingAssistant(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 whitespace-nowrap">
          + Nuevo Asistente
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">Cargando equipo...</td></tr>
            ) : filteredAssistants.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">No hay asistentes registrados.</td></tr>
            ) : (
              filteredAssistants.map((assistant) => (
                <tr key={assistant.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-medium">{assistant.name}</td>
                  <td className="px-6 py-4 text-slate-500">{assistant.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${assistant.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {assistant.role === 'admin' ? 'Administrador' : 'Asistente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingAssistant(assistant); setIsModalOpen(true); }} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(assistant.id, assistant.name)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateAssistantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAssistants} assistantToEdit={editingAssistant} />
    </div>
  );
}