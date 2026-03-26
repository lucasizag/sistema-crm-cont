import { X, Calendar, User as UserIcon, AlignLeft, Building2, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

export default function ViewTaskModal({ isOpen, onClose, task }: Props) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-6 pr-8">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{task.title}</h2>
            {task.condition === 'Especial' && (
              <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-purple-200 mt-2 inline-block">
                TAREA ESPECIAL ⭐
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Cliente */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</p>
              <p className="text-sm font-semibold text-slate-700">{task.client?.name || 'General / Interna'}</p>
            </div>
          </div>

          {/* Responsable */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responsable</p>
              <p className="text-sm font-semibold text-slate-700">{task.assignedTo?.name || 'Sin asignar'}</p>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Asignación</p>
            <p className="text-sm font-semibold text-slate-800">{task.createdAt ? new Date(task.createdAt).toLocaleDateString('es-AR') : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Deadline Interno</p>
            <p className="text-sm font-bold text-indigo-700">{task.assistantDeadline ? new Date(task.assistantDeadline).toLocaleDateString('es-AR') : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Vencimiento</p>
            <p className="text-sm font-bold text-red-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-AR') : '-'}</p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlignLeft className="w-3.5 h-3.5" /> Descripción / Notas
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px] text-sm text-slate-600 whitespace-pre-line">
            {task.description || <span className="italic text-slate-400">Sin descripción adicional.</span>}
          </div>
        </div>

      </div>
    </div>
  );
}