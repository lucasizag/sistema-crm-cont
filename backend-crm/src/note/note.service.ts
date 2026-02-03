import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NoteService {
  constructor(@InjectRepository(Note) private noteRepo: Repository<Note>) {}

  create(createNoteDto: CreateNoteDto) {
    const newNote = this.noteRepo.create({
      content: createNoteDto.content,
      client: { id: createNoteDto.clientId }
    });
    return this.noteRepo.save(newNote);
  }

  findAll() {
    return this.noteRepo.find();
  }

  // Buscar notas de UN cliente específico
  findByClient(clientId: string) {
    return this.noteRepo.find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' } // Las más nuevas primero
    });
  }
}