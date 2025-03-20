export class GithubAuthResponseModel {
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public baseURL: string
  ) {}
}
