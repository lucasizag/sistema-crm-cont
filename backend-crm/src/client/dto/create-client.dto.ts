export class CreateClientDto {
  name: string;
  cuit: string;
  taxType: string;
  address?: string;
  email?: string;
  phone?: string;
  startDate?: string | Date;
  closeMonth?: string;
  dropDate?: string | Date;
  
  // --- NUEVO CAMPO ---
  predeterminedTasks?: any[];
}