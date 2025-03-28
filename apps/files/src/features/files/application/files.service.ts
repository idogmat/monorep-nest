import { Injectable } from '@nestjs/common';
import { FilesRepository } from '../infrastructure/files.repository';



@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository) {
  }

}