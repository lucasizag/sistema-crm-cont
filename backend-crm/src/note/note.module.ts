import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { Note } from './entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note])], // <--- IMPORTANTE
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}