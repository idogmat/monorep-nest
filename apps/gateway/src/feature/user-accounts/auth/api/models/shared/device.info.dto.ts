export class DeviceInfoDto {
  title: string; // Браузер пользователя
  ip: string; // IP-адрес пользователя

  constructor(title: string, ip: string) {
    this.title = title;
    this.ip = ip;
  }
}
