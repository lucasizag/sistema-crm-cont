import { UserCircle, Plus } from 'lucide-react';

export default function Asistentes() {
  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 border border-indigo-200">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Equipo y Asistentes</h1>
            <p className="text-slate-500 text-sm">Gestiona los accesos del personal del estudio.</p>
          </div>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center border-dashed">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <UserCircle className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Módulo en construcción</h3>
        <p className="text-slate-500 mt-2 max-w-md">
          Próximamente aquí podrás agregar a tus empleados, asignarles contraseñas y ver qué tareas están haciendo.
        </p>
      </div>
    </div>
  );
}