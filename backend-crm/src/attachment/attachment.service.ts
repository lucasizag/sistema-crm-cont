import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment) private attachmentRepo: Repository<Attachment>,
  ) {}

  create(data: { filename: string; originalName: string; mimeType: string; taskId: string }) {
    const newAtt = this.attachmentRepo.create({
      ...data,
      task: { id: data.taskId }
    });
    return this.attachmentRepo.save(newAtt);
  }

  findByTask(taskId: string) {
    return this.attachmentRepo.find({ where: { task: { id: taskId } } });
  }

  async remove(id: string) {
    const attachment = await this.attachmentRepo.findOne({ where: { id } });
    if (attachment) {
      // Borrar archivo físico del disco
      const filePath = path.join(__dirname, '..', '..', 'uploads', attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Borrar de base de datos
      return this.attachmentRepo.remove(attachment);
    }
  }
}