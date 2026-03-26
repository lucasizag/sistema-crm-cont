import { useEffect, useState } from 'react';
import { Search, Pencil, Briefcase, Trash2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import CreateClientModal from './CreateClientModal';

interface Client {
  id: string;
  name: string;
  cuit: string;
  taxType: string;
  closeMonth?: string; // NUEVO: Agregamos el mes de cierre a la interfaz
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ClientList({ user }: { user: any }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState(""); // NUEVO: Estado para el filtro de mes
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

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
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar al cliente "${name}"?\nEsta acción no se puede deshacer.`);
    
    if (confirmDelete) {
      try {
        await api.delete(`/client/${id}`);
        fetchClients();
      } catch (error) {
        console.error("Error eliminando cliente:", error);
      }
    }
  };

  // NUEVA LÓGICA DE FILTRADO MÚLTIPLE
  const filteredClients = clients.filter(client => {
    // 1. Filtro por texto (Nombre o CUIT)
    const term = searchTerm.toLowerCase();
    const name = client.name ? client.name.toLowerCase() : "";
    const cuit = client.cuit ? client.cuit : "";
    const matchesSearch = name.includes(term) || cuit.includes(term);

    // 2. Filtro por Mes de Cierre
    const matchesMonth = filterMonth === "" || client.closeMonth === filterMonth;

    return matchesSearch && matchesMonth;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        
        {/* BARRA DE FILTROS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          
          {/* Buscador de Texto */}
          <div className="relative w-full sm:max-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Buscar por nombre o CUIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* NUEVO: Selector de Mes de Cierre */}
          <div className="relative w-full sm:max-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-600 font-medium appearance-none"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">Todos los meses</option>
              {MONTHS.map(mes => (
                <option key={mes} value={mes}>Cierre: {mes}</option>
              ))}
            </select>
          </div>

        </div>

        {/* BOTÓN NUEVO CLIENTE */}
        {isAdmin && (
          <button 
            onClick={handleCreate}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex justify-center items-center whitespace-nowrap"
          >
            + Nuevo Cliente
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                <th className="px-6 py-4 font-semibold">Nombre / Razón Social</th>
                <th className="px-6 py-4 font-semibold">CUIT</th>
                <th className="px-6 py-4 font-semibold">Condición Fiscal</th>
                <th className="px-6 py-4 font-semibold text-center">Cierre</th> {/* NUEVA COLUMNA */}
                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Cargando...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No se encontraron clientes.</td></tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{client.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{client.cuit || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                      {client.taxType || 'N/A'}
                    </span>
                  </td>
                  
                  {/* NUEVA CELDA: Mes de Cierre */}
                  <td className="px-6 py-4 text-center">
                    {client.closeMonth ? (
                      <span className="text-slate-700 font-medium text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                        {client.closeMonth}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-sm italic">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleEdit(client)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      <Link 
                        to={`/client/${client.id}`} 
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Ver Control de Tareas"
                      >
                        <Briefcase className="w-4 h-4" />
                      </Link>

                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <CreateClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchClients} 
          clientToEdit={editingClient} 
        />
      )}
    </div>
  );
}