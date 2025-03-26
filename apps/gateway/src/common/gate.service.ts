import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { createReadStream, createWriteStream, unlinkSync } from "fs";
import { Readable } from "stream";
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
      : 'https://files.myin-gram.ru/api/v1'
    this.profileService = this.env
      ? `http://localhost:${this.configService.get('PROFILE_LOCAL_PORT')}/api/v1`
      : 'http://0.0.0.0:3814/api/v1'
  }

  async profileServicePost(path, headers, payload) {
    console.log(this.profileService)

    const response = await lastValueFrom(this.httpService.post(
      this.profileService,
      payload,
      {
        headers
      }
    ));
    return response.data
  }

  async profileServiceGet(path, query) {
    console.log(this.profileService)

    const response = await lastValueFrom(this.httpService.get(
      [this.profileService, path].join('/'),
    ));
    return response.data
  }
}