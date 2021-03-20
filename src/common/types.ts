import stream from 'stream'

export interface FileStreamToUpload {
  stream: stream,
  fileNameWithExtension: string,
  fileName: string,
  fileExtension: string,
  contentType: string
}
