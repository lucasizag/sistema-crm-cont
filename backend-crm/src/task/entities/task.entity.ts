import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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

  @Column({ default: 'Predeterminada' })
  condition: string;

  @Column({ nullable: true })
  comment: string;

  // --- NUEVAS COLUMNAS DE HORAS ---
  @Column('float', { default: 0 }) 
  estimatedHours: number; // Horas Presupuestadas

  @Column('float', { default: 0 }) 
  actualHours: number;    // Horas Reales Insumidas

  @ManyToOne(() => Client, (client) => client.tasks)
  client: Client;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: 'assignedToId' }) 
  assignedTo: User | null;

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];
}