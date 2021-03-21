import express from 'express';
import { PassThrough, Readable } from 'stream';
import { FileStreamToUpload } from '../common/types'
import { RESOLUTIONS, MAX_SIZE } from '../common/constants';
import { uploadToStore } from './file_upload'
import sharp from 'sharp';

export function processImage(imageStream: FileStreamToUpload): Promise<any> {
  let transform = sharp()

  imageStream.stream.pipe(transform)

  let promises = 
    RESOLUTIONS.map((size: string) => {
      let uploadStream = transform.clone()
          .resize(parseInt(size))
          .png()

      let file_name_to_upload = imageStream.fileName.concat('_', size.toString(), '.', imageStream.fileExtension)

      return uploadToStore(uploadStream, file_name_to_upload)
    })

  return Promise.all(promises)
}

export function processFile(fileStream: FileStreamToUpload): Promise<any> {
  return uploadToStore(fileStream.stream, fileStream.fileNameWithExtension)
}

export function createSizeStream(fileStream: Readable, cb: Function): PassThrough {
  let fileBytesRead = 0
  let sizeStream = new PassThrough()

  sizeStream.on('data', function(this: Readable, chunk: any) {
    fileBytesRead += chunk.length

    console.log(`Bytes read from stream: ${fileBytesRead}`);

    if (fileBytesRead > MAX_SIZE) {
      this.emit('error', new Error(`Exceeded file limit ${MAX_SIZE}, on chunk size: ${fileBytesRead}`))

      fileStream.destroy()
    }
  })

  sizeStream.on('error', (err: Error) => {
    cb(err)
  })

  return sizeStream
}

export function createFileStream(req: express.Request): FileStreamToUpload {
  let fileStream = new PassThrough()
  let original_file_name_splitted = req.params.file_name.split('.')
  let contentType = req.get('Content-Type') || ''

  let fileStreamToUpload : FileStreamToUpload = {
    stream: fileStream,
    fileNameWithExtension: req.params.file_name,
    fileName: original_file_name_splitted[0],
    fileExtension: original_file_name_splitted[1],
    contentType: contentType
  }

  return fileStreamToUpload
}
