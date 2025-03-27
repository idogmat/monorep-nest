export type UploadResult = { fileName: string; status: "success" | "error"; error: string| null};

export interface SuccessfulUpload {
  status: 'success';  // Успешная загрузка
  file: string;       // Имя файла
  url: string;        // URL файла в S3
}

export interface FailedUpload {
  status: 'error';    // Ошибка загрузки
  file: string;       // Имя файла
  error: string;      // Сообщение об ошибке
}