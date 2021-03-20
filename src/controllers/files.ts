import express from 'express';
import sharp from 'sharp';
import { uploadToStore } from '../utils'
import { FileStreamToUpload } from '../common/types'
import { Readable } from 'stream'

const AVAILABLE_EXTENSIONS = process.env.AVAILABLE_EXTENSIONS?.split(',') || []
const RESOLUTIONS = process.env.RESOLUTIONS?.split(',') || []
const MAX_SIZE = process.env.MAX_SIZE || 1000

export async function uploadFile (req: express.Request, res: express.Response): Promise<any> {
  let contentType = req.get('Content-Type') || ''
  let original_file_name_splitted = req.params.file_name.split('.')
  let fileBytesRead = 0

  if(!contentType) {
    res.writeHead(400, {"content-type":"text/html"})
    res.end('Invalid Content-Type');
  }

  if(!original_file_name_splitted[0]) {
    res.writeHead(400, {"content-type":"text/html"})
    res.end('Invalid file name');
  }

  if(!AVAILABLE_EXTENSIONS.includes(original_file_name_splitted[1])) {
    res.writeHead(400, {"content-type":"text/html"})
    res.end(`Invalid file extension: ${original_file_name_splitted[1]}, available extensions are: ${AVAILABLE_EXTENSIONS}`);
  }

  let fileStreamToUpload : FileStreamToUpload = {
    stream: req,
    fileNameWithExtension: req.params.file_name,
    fileName: original_file_name_splitted[0],
    fileExtension: original_file_name_splitted[1],
    contentType: contentType
  }

  fileStreamToUpload.stream.on('data', function(this: Readable, chunk: any) {
    fileBytesRead += chunk.length

    console.log(fileBytesRead);

    if (fileBytesRead > 900000) {
      console.log(`Exceeded file limit ${MAX_SIZE}, on chunk size: ${fileBytesRead}`)

      this.destroy()
    }
  })

  let uploadPromise =
    fileStreamToUpload.contentType.includes('image') ? _processImage(fileStreamToUpload) : _processFile(fileStreamToUpload)

  uploadPromise.then((file) => {
    res.writeHead(200, {"content-type":"text/html"})
    res.end(`Finished processing file: ${file}`);
  }).catch( err => {
    res.writeHead(200, {"content-type":"text/html"})
    res.end(`Error processing file: ${err}`);
  })
}

function _processImage(imageStream: FileStreamToUpload): Promise<any> {
  let transform = sharp()

  imageStream.stream.pipe(transform);

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

function _processFile(fileStream: FileStreamToUpload): Promise<any> {
  return uploadToStore(fileStream.stream, fileStream.fileNameWithExtension)
}
