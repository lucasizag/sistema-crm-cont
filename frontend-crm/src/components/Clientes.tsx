import ClientList from './ClientList';
import { Users } from 'lucide-react';

export default function Clientes() {
  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 border border-indigo-200">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Directorio de Clientes</h1>
          <p className="text-slate-500 text-sm">Gestiona la información y documentos de todos tus clientes.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <ClientList />
      </div>
    </div>
  );
}