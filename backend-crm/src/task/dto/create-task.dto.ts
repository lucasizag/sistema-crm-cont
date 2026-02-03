export class CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  clientId: string;
  userId?: string;
  
  // --- AGREGAR ESTO ---
  status?: string; // <--- Faltaba esto para poder cambiar de PENDIENTE a COMPLETADA

  estimatedHours?: number;
  actualHours?: number;
}