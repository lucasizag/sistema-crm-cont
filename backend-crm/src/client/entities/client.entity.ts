import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../task/entities/task.entity';
import { Note } from '../../note/entities/note.entity';

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

  // --- NUEVAS COLUMNAS DE CONTACTO ---
  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;
  // -----------------------------------

  @OneToMany(() => Task, (task) => task.client)
  tasks: Task[];

  @OneToMany(() => Note, (note) => note.client)
  notes: Note[];

  @Column({ type: 'date', nullable: true })
  startDate: Date | null; // Fecha de Alta

  @Column({ nullable: true })
  closeMonth: string; // Mes de cierre de ejercicio (Ej: 'Diciembre')

  @Column({ type: 'date', nullable: true })
  dropDate: Date | null; // Fecha de baja definitiva del estudio
}