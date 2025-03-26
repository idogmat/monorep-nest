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
    this.fileService = `http://localhost:${this.configService.get('FILE_LOCAL_PORT')}`
    this.profileService = `http://localhost:${this.configService.get('PROFILE_LOCAL_PORT')}`
  }

  async profileServicePost(path, headers, payload) {
    console.log(this.profileService)

    const response = await lastValueFrom(this.httpService.post(
      [this.profileService, path].join('/'),
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