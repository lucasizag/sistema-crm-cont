import { CheckSquare, Plus } from 'lucide-react';

export default function Tareas() {
  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 border border-indigo-200">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Tareas</h1>
            <p className="text-slate-500 text-sm">Todas las obligaciones del estudio en un solo lugar.</p>
          </div>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
          <Plus className="w-4 h-4" /> Crear Tarea
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center border-dashed">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <CheckSquare className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Tablero de Tareas</h3>
        <p className="text-slate-500 mt-2 max-w-md">
          Aquí colocaremos un listado completo para filtrar tareas por cliente, por vencimiento o por empleado asignado.
        </p>
      </div>
    </div>
  );
}