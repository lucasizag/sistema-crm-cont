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

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Task, (task) => task.client)
  tasks: Task[];

  @OneToMany(() => Note, (note) => note.client)
  notes: Note[];

  @Column({ type: 'date', nullable: true })
  startDate: Date | null; 

  @Column({ nullable: true })
  closeMonth: string; 

  @Column({ type: 'date', nullable: true })
  dropDate: Date | null; 

  // --- NUEVA COLUMNA JSON PARA TAREAS PREDETERMINADAS ---
  @Column({ type: 'json', nullable: true })
  predeterminedTasks: any; 
}