import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, ManyToMany, JoinTable, OneToMany,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Especialidade } from '../especialidades/especialidade.entity';
import { Sessao } from '../sessoes/sessao.entity';

@Entity('mentores')
export class Mentor {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'usuario_id', unsigned: true })
  usuarioId: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'preco_hora', type: 'decimal', precision: 8, scale: 2, default: 0 })
  precoHora: number;

  @Column({ name: 'anos_experiencia', unsigned: true, default: 0 })
  anosExperiencia: number;

  @Column({ name: 'linkedin_url', length: 300, nullable: true })
  linkedinUrl: string;

  @Column({ default: false })
  aprovado: boolean;

  @Column({ name: 'avaliacao_media', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avaliacaoMedia: number;

  @Column({ name: 'total_sessoes', unsigned: true, default: 0 })
  totalSessoes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ── Relacionamentos ──────────────────────────
  @OneToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  // M:N com especialidades via mentor_especialidade
  @ManyToMany(() => Especialidade, { eager: true })
  @JoinTable({
    name: 'mentor_especialidade',
    joinColumn:        { name: 'mentor_id',        referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'especialidade_id', referencedColumnName: 'id' },
  })
  especialidades: Especialidade[];

  @OneToMany(() => Sessao, (sessao) => sessao.mentor)
  sessoes: Sessao[];
}
