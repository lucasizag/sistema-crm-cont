export class CreateClientDto {
  name: string;
  cuit: string;
  taxType: string;
  startDate?: string | Date;
  closeMonth?: string; // NUEVO: Mes de cierre (Ej: 'Diciembre')
  dropDate?: string | Date; // NUEVO: Fecha de baja definitiva
}