import { Mentor } from '../../src/modules/mentores/mentor.entity';
import { Especialidade } from '../../src/modules/especialidades/especialidade.entity';
import { Usuario, TipoUsuario } from '../../src/modules/usuarios/usuario.entity';
import { CreateMentorDto, UpdateMentorDto } from '../../src/modules/mentores/dto/mentor.dto';

// ── Factories ────────────────────────────────────
// Funções que criam objetos de teste com valores padrão
// substituíveis via override parcial.

export function makeUsuario(override: Partial<Usuario> = {}): Usuario {
  return Object.assign(new Usuario(), {
    id:          1,
    nome:        'Ana Lima',
    email:       'ana@email.com',
    tipoUsuario: TipoUsuario.MENTOR,
    ativo:       true,
    createdAt:   new Date('2026-01-01'),
    updatedAt:   new Date('2026-01-01'),
    ...override,
  });
}

export function makeEspecialidade(override: Partial<Especialidade> = {}): Especialidade {
  return Object.assign(new Especialidade(), {
    id:        1,
    nome:      'Product Management',
    descricao: 'Gestão de produto, roadmap e OKRs',
    icone:     '🧩',
    ativo:     true,
    createdAt: new Date('2026-01-01'),
    ...override,
  });
}

export function makeMentor(override: Partial<Mentor> = {}): Mentor {
  return Object.assign(new Mentor(), {
    id:              1,
    usuarioId:       1,
    bio:             'PM com 8 anos de experiência.',
    precoHora:       150.00,
    anosExperiencia: 8,
    linkedinUrl:     'linkedin.com/in/analima',
    aprovado:        true,
    avaliacaoMedia:  4.90,
    totalSessoes:    32,
    usuario:         makeUsuario(),
    especialidades:  [makeEspecialidade()],
    createdAt:       new Date('2026-01-01'),
    updatedAt:       new Date('2026-01-01'),
    ...override,
  });
}

export function makeCreateMentorDto(override: Partial<CreateMentorDto> = {}): CreateMentorDto {
  return {
    usuarioId:        2,
    bio:              'Mentor experiente em tecnologia.',
    precoHora:        120.00,
    anosExperiencia:  6,
    linkedinUrl:      'linkedin.com/in/pedrocosta',
    especialidadeIds: [1, 2],
    ...override,
  };
}

export function makeUpdateMentorDto(override: Partial<UpdateMentorDto> = {}): UpdateMentorDto {
  return {
    bio:      'Bio atualizada.',
    precoHora: 130.00,
    ...override,
  };
}
