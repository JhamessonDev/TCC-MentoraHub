import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentoresController } from './mentores.controller';
import { MentoresService } from './mentores.service';
import { Mentor } from './mentor.entity';
import { Especialidade } from '../especialidades/especialidade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mentor, Especialidade]),
  ],
  controllers: [MentoresController],
  providers: [MentoresService],
  exports: [MentoresService],
})
export class MentoresModule {}
