import { useEffect, useState } from 'react';
import { Users, Briefcase, Search, X, Pencil } from 'lucide-react'; // <--- Agregamos Pencil
import { Link } from 'react-router-dom';
import api from '../api';
import CreateClientModal from './CreateClientModal';
import Dashboard from './Dashboard';

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
  
  // ESTADO NUEVO: Guarda el cliente que vamos a editar
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/client');
      setClients(response.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  // Función para abrir el modal en modo EDICIÓN
  const handleEdit = (client: Client) => {
    setEditingClient(client); // Guardamos el cliente a editar
    setIsModalOpen(true);     // Abrimos el modal
  };

  // Función para abrir el modal en modo CREACIÓN
  const handleCreate = () => {
    setEditingClient(null);   // Nos aseguramos que esté vacío
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const name = client.name ? client.name.toLowerCase() : "";
    const cuit = client.cuit ? client.cuit : "";
    return name.includes(term) || cuit.includes(term);
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 mb-20">
      
      <Dashboard />

      <div className="p-6 bg-white rounded-lg shadow-lg">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Clientes
          </h2>
          
          <button 
            onClick={handleCreate} // <--- Usamos la nueva función handleCreate
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition whitespace-nowrap"
          >
            + Nuevo Cliente
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Buscar por nombre o CUIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="p-3 border-b">Nombre / Razón Social</th>
                <th className="p-3 border-b">CUIT</th>
                <th className="p-3 border-b">Condición Fiscal</th>
                <th className="p-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay clientes cargados.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition border-b last:border-0">
                    <td className="p-3 font-medium text-gray-800">{client.name || 'Sin Nombre'}</td>
                    <td className="p-3 text-gray-600">{client.cuit || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                        {client.taxType || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-center flex items-center justify-center gap-2">
                      {/* BOTON DE EDITAR (LAPIZ) */}
                      <button 
                        onClick={() => handleEdit(client)}
                        className="text-gray-400 hover:text-green-600 transition"
                        title="Editar datos del cliente"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      {/* BOTON DE VER TAREAS (MALETIN) */}
                      <Link 
                        to={`/client/${client.id}`} 
                        className="text-gray-400 hover:text-blue-600 transition"
                        title="Ver Tareas y Vencimientos"
                      >
                        <Briefcase className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Le pasamos la propiedad clientToEdit al modal */}
        <CreateClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchClients} 
          clientToEdit={editingClient} 
        />
      </div>
    </div>
  );
}