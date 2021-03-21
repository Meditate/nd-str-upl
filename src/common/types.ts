import { PassThrough } from 'stream'

export interface FileStreamToUpload {
  stream: PassThrough,
  fileNameWithExtension: string,
  fileName: string,
  fileExtension: string,
  contentType: string
}

export interface ResponseMock {
  writeHead: any,
  end: any
}

export interface RequestMock {
  get: any,
  params: any,
  pipe: any
}
