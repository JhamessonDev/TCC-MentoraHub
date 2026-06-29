import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessoesService } from './sessoes.service';
import { CancelarSessaoDto, CreateSessaoDto } from './dto/sessao.dto';
import { QueryMetricasDto } from './dto/metricas.dto';

@ApiTags('Sessoes')
@ApiBearerAuth()
@Controller('sessoes')
@UseGuards(JwtAuthGuard)
export class SessoesController {
  constructor(private readonly sessoesService: SessoesService) {}

  // ── GET /sessoes/metricas — admin ──────────────
  @Get('metricas')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Métricas do dashboard agregadas por período (admin)' })
  @ApiResponse({ status: 200, description: 'Evolução diária, totais e comparativo com período anterior' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  metricas(@Query() query: QueryMetricasDto) {
    return this.sessoesService.getMetricas(query.periodo ?? '30d');
  }

  // ── GET /sessoes — somente admin ────────────────
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todas as sessões do sistema (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de sessões com dados de mentor e mentorando' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  findAll() {
    return this.sessoesService.findAll();
  }

  // ── POST /sessoes ───────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Agendar nova sessão' })
  @ApiResponse({ status: 201, description: 'Sessão criada' })
  create(
    @Body() dto: CreateSessaoDto,
    @CurrentUser() user: { id: number },
  ) {
    dto.mentorandoId = user.id;
    return this.sessoesService.create(dto);
  }

  // ── PATCH /sessoes/:id/cancelar ────────────────
  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar sessão (mentor ou mentorando da sessão)' })
  @ApiResponse({ status: 200, description: 'Sessão cancelada com motivo registrado' })
  @ApiResponse({ status: 400, description: 'Sessão já realizada ou cancelada' })
  @ApiResponse({ status: 403, description: 'Usuário não é participante desta sessão' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarSessaoDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.sessoesService.cancelar(id, user.id, dto);
  }

  // ── GET /sessoes/minhas ─────────────────────────
  @Get('minhas')
  @ApiOperation({ summary: 'Listar sessões do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Sessões do usuário' })
  minhas(@CurrentUser() user: { id: number; tipoUsuario: string }) {
    if (user.tipoUsuario === 'mentor') {
      return this.sessoesService.findByMentor(user.id);
    }
    return this.sessoesService.findByMentorando(user.id);
  }
}
