import { useEffect, useState } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';import api from '../api';

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  taskTitle: string;
}

export default function AttachmentsModal({ isOpen, onClose, taskId, taskTitle }: Props) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      loadFiles();
    }
  }, [isOpen, taskId]);

  const loadFiles = async () => {
    if (!taskId) return;
    try {
      const res = await api.get(`/attachment/task/${taskId}`);
      setFiles(res.data);
    } catch (error) {
      console.error("Error cargando archivos", error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !taskId) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    try {
      await api.post('/attachment/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadFiles(); // Recargar lista
    } catch (error) {
      alert('Error subiendo archivo');
      console.error(error);
    } finally {
      setUploading(false);
      // Limpiamos el input
      e.target.value = ''; 
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Borrar archivo?")) return;
    try {
      await api.delete(`/attachment/${id}`);
      loadFiles();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-1 text-gray-800">Archivos Adjuntos</h2>
        <p className="text-sm text-gray-500 mb-4">Tarea: {taskTitle}</p>

        {/* LISTA DE ARCHIVOS */}
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {files.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4 border-2 border-dashed border-gray-200 rounded">
              No hay archivos adjuntos.
            </p>
          ) : (
            files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <a 
                    href={`http://localhost:3000/uploads/${file.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 truncate hover:text-blue-600 hover:underline"
                  >
                    {file.originalName}
                  </a>
                </div>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* BOTON DE SUBIDA */}
        <div className="mt-4">
          <label className={`flex items-center justify-center w-full p-2 rounded-md border border-transparent font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? (
              <span>Subiendo...</span>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Adjuntar Archivo (PDF, Img)
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              onChange={handleUpload} 
              disabled={uploading}
            />
          </label>
        </div>

      </div>
    </div>
  );
}