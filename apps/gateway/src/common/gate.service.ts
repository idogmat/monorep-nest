import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class GateService {
  readonly env: boolean
  readonly fileService: string
  readonly profileService: string
  readonly postService: string
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
    this.postService = this.env
      ? `http://localhost:${this.configService.get('POST_LOCAL_PORT')}/api/v1`
      : this.configService.get('POST_PROD_SERVICE')
  }

  async profileServicePost(path, payload, headers) {
    console.log([this.profileService, path].join('/'))
    const response = await lastValueFrom(this.httpService.post(
      [this.profileService, path].join('/'),
      payload,
      {
        headers
      }
    ));
    return response
  }

  async profileServicePut(path, payload, headers) {
    const response = await lastValueFrom(this.httpService.put(
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

  async filesServiceGet(path: string, headers) {
    const url = [this.fileService, path].join('/');
    console.log(url)

    const response = await lastValueFrom(this.httpService.get(
      url,
      { headers }
    ));

    return response;

  }

  async postServicePost(path, payload, headers) {
    const response = await lastValueFrom(this.httpService.post(
      [this.postService, path].join('/'),
      payload,
      {
        headers
      }
    ));
    return response;
  }

  async postServicePut(path, payload, headers) {
    const response = await lastValueFrom(this.httpService.put(
      [this.postService, path].join('/'),
      payload,
      {
        headers
      }
    ));
    return response;
  }

  async postServiceDelete(path: string, headers) {
    const response = await lastValueFrom(
      this.httpService.delete(
        [this.postService, path].join('/'),
        {
          headers,
        }
      )
    );
    return response;
  }
  async postServiceGet<T = any>(path: string, headers, params): Promise<T> {

    const url = [this.postService, path].join('/');

    const { data } = await lastValueFrom(this.httpService.get<T>(
      url,
      { headers, params }
    ));

    return data;

  }
  async profileServiceGet(path, headers) {
    // console.log(query, 'query-gate')
    // console.log(Object.entries(query))
    // for (const el of query) {
    //   console.log(el)
    // }
    const url = [this.profileService, path].join('/')
    // if (!query) {
    //   url = `${url}&${query}`
    // }
    console.log(url)

    const response = await lastValueFrom(this.httpService.get(
      url,
      { headers }
    ));
    return response
  }


}