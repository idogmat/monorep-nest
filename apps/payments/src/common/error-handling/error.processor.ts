import { InterlayerNotice, InterlayerNoticeExtension } from './interlayer.notice';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';

export class ErrorProcessor<D = null> {
  public extensions: InterlayerNoticeExtension[];
  public code = 0;
  constructor(result: InterlayerNotice<D>) {
    this.code = result.code;
    this.extensions = result.extensions;
  }

  public handleError() {
    switch (this.code) {
      case 400:
        throw new BadRequestException(this.extensions);

      case 401:
        throw new UnauthorizedException();

      case 403:
        throw new ForbiddenException();

      case 404:
        throw new NotFoundException();
    }
  }
}