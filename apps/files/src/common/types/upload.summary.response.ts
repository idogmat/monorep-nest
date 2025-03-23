import { UploadResult } from './upload.result';

export type UploadSummaryResponse = {
  text: string;
  files: UploadResult[];
  error: boolean;
};