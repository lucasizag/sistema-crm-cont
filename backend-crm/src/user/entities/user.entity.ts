import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../task/entities/task.entity'; // <-- Agrega este import (revisa que la ruta sea correcta)

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true }) // nullable: true por si las dudas si antes no lo tenías
  email: string;

  @Column({ nullable: true }) 
  password: string;

  @Column({ default: 'assistant' })
  role: string;

  // --- ESTO ES LO QUE FALTABA ---
  @OneToMany(() => Task, (task) => task.assignedTo)
  tasks: Task[];
}