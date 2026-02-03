import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.noteService.create(createNoteDto);
  }

  // Endpoint especial: /note/client/EL_ID_DEL_CLIENTE
  @Get('client/:clientId') 
  findByClient(@Param('clientId') clientId: string) {
    return this.noteService.findByClient(clientId);
  }
}