import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Nombre del ayudante (ej: "Juan Perez")

  @OneToMany(() => Task, (task) => task.assignedTo)
  tasks: Task[];
}