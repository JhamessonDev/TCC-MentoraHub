import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, ParseIntPipe, HttpCode, HttpStatus, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { MentoresService } from './mentores.service';
import { CreateMentorDto, UpdateMentorDto, QueryMentorDto, AprovarMentorDto } from './dto/mentor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mentores')
@ApiBearerAuth()
@Controller('mentores')
export class MentoresController {
  constructor(private readonly mentoresService: MentoresService) {}

  // ── POST /mentores ──────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar perfil de mentor' })
  @ApiResponse({ status: 201, description: 'Mentor criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Já existe mentor para este usuário' })
  create(
    @Body() dto: CreateMentorDto,
    @Req() req: Request & { traceId?: string },
  ) {
    return this.mentoresService.create(dto, req.traceId);
  }

  // ── GET /mentores ───────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar mentores com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de mentores' })
  findAll(
    @Query() query: QueryMentorDto,
    @Req() req: Request & { traceId?: string },
  ) {
    return this.mentoresService.findAll(query, req.traceId);
  }

  // ── GET /mentores/:id ───────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Buscar mentor por ID' })
  @ApiParam({ name: 'id', description: 'ID do mentor', example: 1 })
  @ApiResponse({ status: 200, description: 'Mentor encontrado' })
  @ApiResponse({ status: 404, description: 'Mentor não encontrado' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { traceId?: string },
  ) {
    return this.mentoresService.findOne(id, req.traceId);
  }

  // ── PUT /mentores/:id ───────────────────────────
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar perfil de mentor' })
  @ApiParam({ name: 'id', description: 'ID do mentor', example: 1 })
  @ApiResponse({ status: 200, description: 'Mentor atualizado' })
  @ApiResponse({ status: 404, description: 'Mentor não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMentorDto,
    @Req() req: Request & { traceId?: string },
  ) {
    return this.mentoresService.update(id, dto, req.traceId);
  }

  // ── PATCH /mentores/:id/aprovar ─────────────────
  @Patch(':id/aprovar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Aprovar ou reprovar mentor (admin)' })
  @ApiParam({ name: 'id', description: 'ID do mentor', example: 1 })
  @ApiResponse({ status: 200, description: 'Status de aprovação atualizado' })
  aprovar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AprovarMentorDto,
    @Req() req: Request & { traceId?: string },
  ) {
    return this.mentoresService.aprovar(id, dto, req.traceId);
  }

  // ── DELETE /mentores/:id ────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover mentor' })
  @ApiParam({ name: 'id', description: 'ID do mentor', example: 1 })
  @ApiResponse({ status: 204, description: 'Mentor removido' })
  @ApiResponse({ status: 404, description: 'Mentor não encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { traceId?: string },
  ) {
    return this.mentoresService.remove(id, req.traceId);
  }
}
