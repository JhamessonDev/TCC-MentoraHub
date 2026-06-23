import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessoesController } from './sessoes.controller';
import { SessoesService } from './sessoes.service';
import { Sessao } from './sessao.entity';
import { Mentor } from '../mentores/mentor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sessao, Mentor])],
  controllers: [SessoesController],
  providers: [SessoesService],
  exports: [SessoesService],
})
export class SessoesModule {}
