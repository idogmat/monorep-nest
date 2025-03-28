import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GateService {
  readonly env: boolean
  readonly fileService: string
  readonly profileService: string
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // FIXME check env and route path on k8s
    this.env = this.configService.get('NODE_ENV') === 'DEVELOPMENT'
    this.fileService = this.env
      ? `http://localhost:${this.configService.get('FILE_LOCAL_PORT')}/api/v1`
      : this.configService.get('FILE_PROD_SERVICE')
    this.profileService = this.env
      ? `http://localhost:${this.configService.get('PROFILE_LOCAL_PORT')}/api/v1`
      : this.configService.get('PROFILE_PROD_SERVICE')
  }

  async profileServicePost(path, payload, headers) {
    const response = await lastValueFrom(this.httpService.post(
      this.profileService,
      payload,
      {
        headers
      }
    ));
    return response
  }

  async filesServicePost(path, payload, headers) {
    const response = await lastValueFrom(this.httpService.post(
      [this.fileService, path].join('/'),
      payload,
      {
        headers
      }
    ));
    return response;
  }
  async profileServiceGet(path, query) {
    console.log(this.profileService)

    const response = await lastValueFrom(this.httpService.get(
      [this.profileService, path].join('/'),
    ));
    return response.data
  }
}