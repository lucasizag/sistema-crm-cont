import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string; // Nombre real en el disco (ej: uuid-vep.pdf)

  @Column()
  originalName: string; // Nombre original (ej: vep_juan_enero.pdf)

  @Column()
  mimeType: string; // Tipo de archivo (application/pdf, image/jpeg)

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
  task: Task;
}