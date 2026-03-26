export class UpdateClientDto {
  name?: string;
  cuit?: string;
  taxType?: string;
  startDate?: string | Date;
  closeMonth?: string; 
  dropDate?: string | Date; 
}