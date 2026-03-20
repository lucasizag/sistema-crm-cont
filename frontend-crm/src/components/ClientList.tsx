import { useEffect, useState } from 'react';
import { Search, X, Pencil, Briefcase, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import CreateClientModal from './CreateClientModal';

interface Client {
  id: string;
  name: string;
  cuit: string;
  taxType: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/client');
      setClients(response.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar al cliente "${name}"?\nEsta acción no se puede deshacer y eliminará todas sus tareas asociadas.`);
    
    if (confirmDelete) {
      try {
        await api.delete(`/client/${id}`);
        fetchClients(); // Recargamos la lista para que desaparezca
      } catch (error) {
        console.error("Error eliminando cliente:", error);
        alert("Hubo un error al eliminar el cliente. Revisa la consola.");
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const name = client.name ? client.name.toLowerCase() : "";
    const cuit = client.cuit ? client.cuit : "";
    return name.includes(term) || cuit.includes(term);
  });

  return (
    <div className="w-full">
      
      {/* Controles Superiores: Búsqueda y Botón */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        
        {/* Buscador */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Buscar por nombre o CUIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Botón Nuevo Cliente */}
        <button 
          onClick={handleCreate}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex justify-center items-center whitespace-nowrap"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Tabla de Clientes */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nombre / Razón Social</th>
                <th className="px-6 py-4 font-semibold">CUIT</th>
                <th className="px-6 py-4 font-semibold">Condición Fiscal</th>
                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    Cargando directorio...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    {searchTerm 
                      ? <p>No encontramos ningún cliente que coincida con "<span className="font-semibold">{searchTerm}</span>".</p> 
                      : <p>Aún no hay clientes registrados. ¡Haz clic en "+ Nuevo Cliente" para empezar!</p>
                    }
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{client.name || 'Sin Nombre'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      {client.cuit || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {client.taxType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        
                        {/* Botón Editar */}
                        <button 
                          onClick={() => handleEdit(client)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar datos del cliente"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Botón Ver Detalles */}
                        <Link 
                          to={`/client/${client.id}`} 
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Ver Tareas y Documentos"
                        >
                          <Briefcase className="w-4 h-4" />
                        </Link>

                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar cliente"
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
      </div>

      <CreateClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClients} 
        clientToEdit={editingClient} 
      />
      
    </div>
  );
}