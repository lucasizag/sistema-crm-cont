import { useEffect, useState } from 'react';
import api from '../api';
import { Pencil, Trash2, Search, Briefcase } from 'lucide-react';
import CreateAssistantModal from './CreateAssistantModal';
import AssistantTasksModal from './AssistantTasksModal'; // <--- IMPORTAMOS EL NUEVO MODAL

export default function AssistantList() {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ESTADO PARA EL NUEVO MODAL DEL MALETÍN
  const [viewingTasksAssistant, setViewingTasksAssistant] = useState(null);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/user'); 
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
                <tr key={assistant.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-4 font-medium">{assistant.name}</td>
                  <td className="px-6 py-4 text-slate-500">{assistant.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${assistant.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {assistant.role === 'admin' ? 'Administrador' : 'Asistente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* BOTÓN DEL MALETÍN MAGICO */}
                      <button 
                        onClick={() => setViewingTasksAssistant(assistant)} 
                        className="p-2 bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-transparent hover:border-emerald-100 rounded-lg shadow-sm transition-all"
                        title="Ver Maletín de Trabajo"
                      >
                        <Briefcase className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => { setEditingAssistant(assistant); setIsModalOpen(true); }} 
                        className="p-2 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 rounded-lg shadow-sm transition-all"
                        title="Editar Perfil"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(assistant.id, assistant.name)} 
                        className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded-lg shadow-sm transition-all"
                        title="Eliminar Acceso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateAssistantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAssistants} assistantToEdit={editingAssistant} />
      
      {/* RENDERIZAMOS EL MODAL NUEVO AQUÍ ABAJO */}
      <AssistantTasksModal 
        isOpen={!!viewingTasksAssistant} 
        onClose={() => setViewingTasksAssistant(null)} 
        assistant={viewingTasksAssistant} 
      />
      
    </div>
  );
}