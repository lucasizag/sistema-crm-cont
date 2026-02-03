import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Trash2, 
  CheckSquare, 
  Square, 
  User as UserIcon, 
  Pencil, 
  MessageSquare, 
  Send, 
  Paperclip,
  AlertTriangle 
} from 'lucide-react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';
import AttachmentsModal from './AttachmentsModal';

// --- 1. DEFINICIONES DE TIPOS (INTERFACES) ---
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  assignedTo?: { id: string; name: string };
  estimatedHours: number;
  actualHours: number;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  cuit: string;
  taxType: string;
  tasks: Task[];
}

export default function ClientDetails() {
  const { id } = useParams();
  
  // Estados de datos
  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState("");

  // Estados de Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [attachTask, setAttachTask] = useState<{id: string, title: string} | null>(null);

  // --- 2. CARGA DE DATOS ---
  const fetchClientData = useCallback(async () => {
    if (!id) return;
    try {
      setError(""); 
      const clientRes = await api.get(`/client/${id}`);
      setClient(clientRes.data);

      const notesRes = await api.get(`/note/client/${id}`);
      setNotes(notesRes.data);

    } catch (err: any) {
      console.error("ERROR CRÍTICO:", err);
      setError(err.response?.data?.message || err.message || "Error desconocido al conectar con el servidor.");
    }
  }, [id]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  // --- 3. FUNCIONES DE LÓGICA ---

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !id) return;
    try {
      await api.post('/note', { content: newNote, clientId: id });
      setNewNote("");
      const res = await api.get(`/note/client/${id}`);
      setNotes(res.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la nota");
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null); 
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task); 
    setIsModalOpen(true);
  };

  const handleOpenAttachments = (task: Task) => {
    setAttachTask({ id: task.id, title: task.title });
    setIsAttachModalOpen(true);
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'PENDIENTE' ? 'COMPLETADA' : 'PENDIENTE';
      await api.patch(`/task/${task.id}`, { status: newStatus });
      fetchClientData();
    } catch (error) { console.error(error); }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Borrar tarea?')) return;
    try { 
      await api.delete(`/task/${taskId}`); 
      fetchClientData(); 
    } catch (error) { console.error(error); }
  };

  const getDeadlineStyle = (dueDate: string, status: string) => {
    if (status === 'COMPLETADA') return { color: 'bg-gray-100 text-gray-500 border-gray-200', text: 'Completada' };
    if (!dueDate) return { color: 'bg-gray-50 text-gray-600', text: 'Sin fecha' };
    
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (86400000));
    
    if (diffDays < 0) return { color: 'bg-red-100 text-red-700 border-red-200 font-bold', text: 'VENCIDA' };
    if (diffDays <= 3) return { color: 'bg-orange-100 text-orange-700 border-orange-200 font-bold', text: 'Urgente' };
    return { color: 'bg-green-100 text-green-700 border-green-200', text: 'A tiempo' };
  };

  // --- 4. RENDERIZADO (VISTAS) ---

  if (error) return (
    <div className="p-10 text-center flex flex-col items-center justify-center h-[50vh]">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Ups, algo salió mal</h2>
      <p className="text-red-600 mt-2 bg-red-50 p-4 rounded border border-red-200">{error}</p>
      <Link to="/" className="mt-6 text-blue-600 hover:underline">Volver al inicio</Link>
    </div>
  );

  if (!client) return <div className="p-10 text-center text-gray-500">Cargando datos del cliente...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 mb-20">
      <Link to="/" className="flex items-center text-gray-500 hover:text-blue-600 mb-6 w-fit">
        <ArrowLeft className="w-5 h-5 mr-1" /> Volver al listado
      </Link>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-600">
        <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
        <div className="flex gap-6 mt-2 text-gray-600">
          <p>🆔 CUIT: {client.cuit}</p>
          <p>⚖️ {client.taxType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA TAREAS (2/3 del ancho) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Control de Tareas
            </h2>
            <button onClick={handleCreateTask} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">+ Nueva Tarea</button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {client.tasks && client.tasks.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Tarea</th>
                    <th className="p-3 text-center">Horas (Est / Real)</th>
                    <th className="p-3">Resp.</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {client.tasks.map(task => {
                    const urgency = getDeadlineStyle(task.dueDate, task.status);
                    
                    // --- CÁLCULO DE DIFERENCIA DE HORAS ---
                    const diff = task.actualHours - task.estimatedHours;
                    const hoursColor = diff > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-medium';

                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition">
                        {/* 1. CHECKBOX */}
                        <td className="p-3">
                          <button onClick={() => toggleTaskStatus(task)} className={task.status === 'COMPLETADA' ? 'text-green-600' : 'text-gray-300 hover:text-blue-500'}>
                            {task.status === 'COMPLETADA' ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                        </td>

                        {/* 2. TITULO Y ESTADO */}
                        <td className="p-3">
                          <p className={`font-medium text-sm ${task.status === 'COMPLETADA' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                          {task.status !== 'COMPLETADA' && <span className={`text-[10px] px-1.5 rounded border mt-1 inline-block ${urgency.color}`}>{urgency.text}</span>}
                        </td>

                        {/* 3. COLUMNA DE HORAS (NUEVA) */}
                        <td className="p-3 text-center">
                           <div className="flex flex-col items-center text-xs">
                             <span className="text-gray-500">
                               Est: <b>{task.estimatedHours}h</b>
                             </span>
                             <span className="text-gray-800">
                               Real: <b>{task.actualHours}h</b>
                             </span>
                             
                             {(task.estimatedHours > 0 || task.actualHours > 0) && (
                                <span className={`mt-1 px-2 py-0.5 rounded bg-gray-100 ${hoursColor}`}>
                                  {diff > 0 ? `+${diff}h` : `${diff}h`}
                                </span>
                             )}
                           </div>
                        </td>

                        {/* 4. RESPONSABLE */}
                        <td className="p-3">
                          {task.assignedTo ? <div className="bg-indigo-100 p-1 rounded-full text-indigo-600 inline-block" title={task.assignedTo.name}><UserIcon className="w-3 h-3" /></div> : <span className="text-gray-300">-</span>}
                        </td>

                        {/* 5. FECHA */}
                        <td className="p-3 text-sm text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                        
                        {/* 6. BOTONES DE ACCION */}
                        <td className="p-3 text-right flex justify-end gap-1">
                          <button onClick={() => handleOpenAttachments(task)} className="text-gray-400 hover:text-indigo-600 p-1" title="Adjuntos">
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditTask(task)} className="text-gray-400 hover:text-blue-600 p-1" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-600 p-1" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">No hay tareas pendientes.</div>
            )}
          </div>
        </div>

        {/* COLUMNA BITACORA (1/3 del ancho) */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-fit">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600" /> Bitácora
          </h2>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4 pr-1">
            {notes.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-4">Sin notas registradas.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="bg-white p-3 rounded shadow-sm border border-gray-100 text-sm">
                  <p className="text-gray-800 whitespace-pre-line">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddNote} className="relative">
            <textarea 
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm focus:ring-purple-500 focus:border-purple-500 pr-10"
              rows={3}
              placeholder="Escribe una nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(e); }}}
            />
            <button type="submit" className="absolute bottom-2 right-2 text-purple-600 hover:text-purple-800 bg-white p-1 rounded-full shadow-sm">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* MODALES */}
      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClientData} 
        clientId={client.id}
        taskToEdit={editingTask} 
      />

      <AttachmentsModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        taskId={attachTask?.id || null}
        taskTitle={attachTask?.title || ''}
      />
    </div>
  );
}