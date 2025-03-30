import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(readonly size = 2000000) { }
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    return value?.size <= this.size &&
      ['image/jpeg', 'image/jpg', 'image/png'].includes(value?.mimetype) ? value : null;
  }
}