import { PassThrough } from 'stream'

export interface FileStreamToUpload {
  stream: PassThrough,
  fileNameWithExtension: string,
  fileName: string,
  fileExtension: string,
  contentType: string
}
