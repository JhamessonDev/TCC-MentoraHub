import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Mentor } from '../mentores/mentor.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum StatusSessao {
  AGENDADA   = 'agendada',
  CONFIRMADA = 'confirmada',
  REALIZADA  = 'realizada',
  CANCELADA  = 'cancelada',
}

export enum ModalidadeSessao {
  ONLINE     = 'online',
  PRESENCIAL = 'presencial',
}

@Entity('sessoes')
export class Sessao {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'mentor_id', unsigned: true })
  mentorId: number;

  @Column({ name: 'mentorando_id', unsigned: true })
  mentorandoId: number;

  @Column({ name: 'data_hora', type: 'datetime' })
  dataHora: Date;

  @Column({ name: 'duracao_min', unsigned: true, default: 60 })
  duracaoMin: number;

  @Column({ type: 'enum', enum: ModalidadeSessao, default: ModalidadeSessao.ONLINE })
  modalidade: ModalidadeSessao;

  @Column({ type: 'enum', enum: StatusSessao, default: StatusSessao.AGENDADA })
  status: StatusSessao;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  valor: number;

  @Column({ type: 'text', nullable: true })
  objetivo: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Mentor, (mentor) => mentor.sessoes)
  @JoinColumn({ name: 'mentor_id' })
  mentor: Mentor;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'mentorando_id' })
  mentorando: Usuario;
}
