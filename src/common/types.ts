import { Readable } from 'stream'

export interface FileStreamToUpload {
  stream: Readable,
  fileNameWithExtension: string,
  fileName: string,
  fileExtension: string,
  contentType: string
}
