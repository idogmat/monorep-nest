import { ArgumentMetadata, ParseUUIDPipe } from "@nestjs/common";

export class EnhancedParseUUIDPipe extends ParseUUIDPipe {
  constructor(type: number = 404) {
    super({ errorHttpStatusCode: type, version: '4' });
  }
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata);
    } catch {
      throw this.exceptionFactory(
        `Validation failed (uuid is expected; given "${value}")`,
      );
    }
  }
}