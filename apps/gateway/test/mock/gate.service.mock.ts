import { Injectable } from "@nestjs/common";
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