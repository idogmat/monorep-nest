export interface FileMetadata {
  fileName: string;
  fileUrl: string;
}

export interface FilesUploadedEvent {
  userId: string;
  postId: string;
  files: FileMetadata[];
  timestamp: string;
}