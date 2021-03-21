import stream from 'stream';
import { PassThrough, Readable } from 'stream';
import AWS from 'aws-sdk';
import { FileStreamToUpload } from './common/types'
import sharp from 'sharp';

const RESOLUTIONS = process.env.RESOLUTIONS?.split(',') || []
const MAX_SIZE = process.env.MAX_SIZE || 1000

var s3 = new AWS.S3(
  {
    endpoint: new AWS.Endpoint('http://localhost:4566'),
    s3ForcePathStyle: true
  }
);

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

export function uploadToStore(fileStream: stream, fileName: String): Promise<void> {
  return new Promise((resolve, reject) => {
    function uploadFailed(error: Error) {
      reject(error)
    }

    function uploadCompleted(response: any) {
      resolve(response)
    }

    s3.upload(
      {
        Bucket: process.env.BUCKET_NAME as string,
        Key: fileName as string,
        Body: fileStream
      },
      (err, response) => {
        if (err) uploadFailed(err)

        uploadCompleted(response)
      }
    )
  })
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
