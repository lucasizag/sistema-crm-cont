export class CreateClientDto {
  name: string;
  cuit: string;
  taxType: string;
  startDate?: string | Date;
  closeDate?: string | Date;
}