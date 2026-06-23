import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('especialidades')
export class Especialidade {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 80, unique: true })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ length: 60, nullable: true })
  icone: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
