export class UpdateClientDto {
  name?: string;
  cuit?: string;
  taxType?: string;
  address?: string;
  email?: string;
  phone?: string;
  startDate?: string | Date;
  closeMonth?: string; 
  dropDate?: string | Date; 
}