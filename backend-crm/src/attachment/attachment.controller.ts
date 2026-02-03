import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Body, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentService } from './attachment.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  // SUBIR ARCHIVO
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Carpeta destino (se crea sola si no existe)
      filename: (req, file, cb) => {
        // Generamos un nombre único para no sobreescribir
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body('taskId') taskId: string) {
    // Guardamos la referencia en la BD
    return this.attachmentService.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      taskId: taskId,
    });
  }

  // LISTAR ARCHIVOS DE UNA TAREA
  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.attachmentService.findByTask(taskId);
  }

  // BORRAR ARCHIVO
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachmentService.remove(id);
  }
}
