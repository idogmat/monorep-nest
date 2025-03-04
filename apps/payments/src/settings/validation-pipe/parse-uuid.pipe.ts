import { ArgumentMetadata, BadRequestException, ParseUUIDPipe } from "@nestjs/common";

export class EnhancedParseUUIDPipe extends ParseUUIDPipe {
  constructor(type: number = 400) {
    super({ errorHttpStatusCode: type, version: '4' });
  }
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata);
    } catch {
      throw new BadRequestException({ message: `Validation failed (uuid is expected; given >>> ${value})` })
    }
  }
}