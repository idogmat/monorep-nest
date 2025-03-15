export class GoogleAuthResponseModel {
  constructor(
    public accessToken: string,
    public refreshToken: string,
  ) {}
}