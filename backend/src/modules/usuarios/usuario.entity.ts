import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum TipoUsuario {
  ADMIN      = 'admin',
  MENTOR     = 'mentor',
  MENTORANDO = 'mentorando',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 120 })
  nome: string;

  @Column({ length: 180, unique: true })
  email: string;

  @Column({ length: 255, select: false }) // nunca retorna a senha
  senha: string;

  @Column({ name: 'tipo_usuario', type: 'enum', enum: TipoUsuario, default: TipoUsuario.MENTORANDO })
  tipoUsuario: TipoUsuario;

  @Column({ default: true })
  ativo: boolean;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
