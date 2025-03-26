import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { createReadStream, createWriteStream, unlinkSync } from "fs";
import { Readable } from "stream";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GateServiceMock {

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // FIXME check env and route path on k8s

  }

  async profileServicePost(path, headers, payload) {

    return 'response.data'
  }

  async profileServiceGet(path, query) {

    return 'response.data'
  }
}