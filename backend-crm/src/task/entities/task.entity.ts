import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { Attachment } from '../../attachment/entities/attachment.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'PENDIENTE' })
  status: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  // --- NUEVAS COLUMNAS DE FECHAS ---
  @Column({ type: 'date', nullable: true })
  assistantDeadline: Date | null; // Fecha límite para el asistente

  @CreateDateColumn()
  createdAt: Date; // Fecha en la que se creó/asignó la tarea
  // ---------------------------------

  @Column({ default: 'Predeterminada' })
  condition: string;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => Client, (client) => client.tasks)
  client: Client;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: 'assignedToId' }) 
  assignedTo: User | null;

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];
}