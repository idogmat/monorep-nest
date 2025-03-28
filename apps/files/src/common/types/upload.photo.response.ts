// ✅ Описываем структуру успешной загрузки файла
interface SuccessfulUpload {
  status: 'success';
  file: string;
  url: string;
}

// ✅ Описываем структуру неудачной загрузки файла
interface FailedUpload {
  status: 'error';
  file: string;
  error: string;
}

// ✅ Итоговый тип для ответа
interface UploadResult {
  postId: string;
  successfulUploads: SuccessfulUpload[];
  errorFiles: FailedUpload[];
  message: string;
  error: boolean;
}

export interface UploadPhotoResponse{
  key: string;
  Location: string;
  ETag: string;
  Bucket: string;
}