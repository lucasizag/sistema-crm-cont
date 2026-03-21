import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../task/entities/task.entity';
import { Note } from '../../note/entities/note.entity'; // <--- Importar

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  cuit: string;

  @Column()
  taxType: string;

  @OneToMany(() => Task, (task) => task.client)
  tasks: Task[];

  // --- AGREGAR ESTO ---
  @OneToMany(() => Note, (note) => note.client)
  notes: Note[];

  @Column({ type: 'date', nullable: true })
  startDate: Date | null; // Fecha de Alta

  @Column({ type: 'date', nullable: true })
  closeDate: Date | null; // Fecha de Cierre (Cese)
}