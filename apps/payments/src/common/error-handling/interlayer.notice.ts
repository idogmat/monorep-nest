export class InterlayerNotice<D = null> {
  public data: D | null = null;
  public extensions: InterlayerNoticeExtension[] = [];
  public code = 0;

  constructor(data: D | null = null) {
    this.data = data;
  }

  public addData(data: D): void {
    this.data = data;
  }
  public addError(
    message: string,
    key: string | null = null,
    code: number | null = 1,
  ): void {
    this.code = code;
    this.extensions.push(new InterlayerNoticeExtension(message, key));
  }
  public hasError(): boolean {
    return this.code !== 0;
  }

  static createErrorNotice(message: string, field?: string, code?: number) {
    const errorNotice = new InterlayerNotice(null);
    errorNotice.addError(message, field, code);
    return errorNotice;
  }
}

export class InterlayerNoticeExtension {
  constructor(
    public readonly message: string,
    public readonly field: string | null,
  ) {}
}
