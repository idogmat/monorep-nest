export type UploadResult = { fileName: string; status: "success" | "error"; error: string| null};

export class SuccessfulUpload {
}

export class FailedUpload {
}