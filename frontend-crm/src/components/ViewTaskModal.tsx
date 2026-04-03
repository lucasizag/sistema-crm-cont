import { useEffect, useState } from 'react';
import { X, Eye, Calendar, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import api from '../api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

export default function ViewTaskModal({ isOpen, onClose, task }: Props) {
  const [assistants, setAssistants] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAssistants();
    }
  }, [isOpen]);

  const fetchAssistants = async () => {
    try {
      const res = await api.get('/user');
      setAssistants(res.data);
    } catch (error) {
      console.error("Error cargando asistentes:", error);
    }
  };

  if (!isOpen || !task) return null;

  // Formateador de fechas para que se vean amigables (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    if (dateString.startsWith('1970') || dateString.startsWith('2099')) return '-';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  // Traductor de ID de asistente a Nombre real
  const getAssistantName = (id: string) => {
    const assistant = assistants.find(a => a.id === id);
    return assistant ? assistant.name : 'Sin Asignar';
  };

  // Manejo de compatibilidad: si es un trámite viejo sin sub-tareas, crea una "virtual" para mostrarla igual de bien
  const subTasksToDisplay = task.subTasks && task.subTasks.length > 0 
    ? task.subTasks 
    : [{
        id: task.id,
        title: task.title,
        estimatedHours: task.estimatedHours || '',
        createdAt: task.createdAt,
        assistantDeadline: task.assistantDeadline,
        assignedTo: task.assignedTo?.id || ''
      }];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detalles del Trámite</h2>
            <p className="text-sm text-slate-500">Vista de solo lectura.</p>
          </div>
        </div>

        {/* PADRE: Título, Notas y Vencimiento */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 space-y-4 shadow-sm">
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título del Trámite</h3>
            <p className="text-lg font-bold text-slate-800">{task.title || 'Sin título'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-200/60">
            <div className="md:col-span-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5"/> Tarea (Detalles / Notas)
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200 min-h-[60px] shadow-sm">
                {task.description || <span className="text-slate-400 italic">Sin detalles adicionales.</span>}
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5"/> Fecha de Vencimiento
              </h3>
              <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 flex items-center h-[60px] shadow-sm">
                <p className="text-base font-bold text-red-700">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HIJOS: Sub-tareas */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500"/> Sub-tareas (Renglones)
          </h3>
          
          <div className="space-y-3">
            {subTasksToDisplay.map((sub: any, index: number) => (
              <div key={sub.id || index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
                <p className="font-bold text-slate-800 mb-3 pb-3 border-b border-slate-100 text-sm">
                  <span className="text-slate-400 mr-1">{index + 1}.</span> {sub.title || 'Sin nombre'}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Hrs. Est.</p>
                    <p className="text-sm font-medium text-slate-700">{sub.estimatedHours ? `${sub.estimatedHours} hs` : '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Asignación</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(sub.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Deadline Asist.</p>
                    <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-block border border-indigo-100">{formatDate(sub.assistantDeadline)}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Responsable</p>
                    <p className="text-sm font-medium text-slate-700 truncate" title={getAssistantName(sub.assignedTo)}>
                      {getAssistantName(sub.assignedTo)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}