import express from 'express';
import { processImage, processFile, createSizeStream } from '../utils'
import { FileStreamToUpload } from '../common/types'
import { PassThrough } from 'stream'

const AVAILABLE_EXTENSIONS = process.env.AVAILABLE_EXTENSIONS?.split(',') || []

export async function uploadFile (req: express.Request, res: express.Response): Promise<any> {
  let contentType = req.get('Content-Type') || ''
  let original_file_name_splitted = req.params.file_name.split('.')
  let fileStream = new PassThrough()
  let sizeStream = createSizeStream(req, (err: Error) => _responseWithError(err, res))

  if(!contentType) {
    _responseWithError(new Error('Invalid Content-Type'), res)
  }

  if(!original_file_name_splitted[0]) {
    _responseWithError(new Error('Invalid file name'), res)
  }

  if(!AVAILABLE_EXTENSIONS.includes(original_file_name_splitted[1])) {
    _responseWithError(
      new Error(`Invalid file extension: ${original_file_name_splitted[1]}, available extensions are: ${AVAILABLE_EXTENSIONS}`),
      res
    )
  }

  req.pipe(sizeStream)
  req.pipe(fileStream)

  let fileStreamToUpload : FileStreamToUpload = {
    stream: fileStream,
    fileNameWithExtension: req.params.file_name,
    fileName: original_file_name_splitted[0],
    fileExtension: original_file_name_splitted[1],
    contentType: contentType
  }

  let uploadPromise =
    fileStreamToUpload.contentType.includes('image') ? processImage(fileStreamToUpload) : processFile(fileStreamToUpload)

  uploadPromise.then((file) => {
    res.writeHead(200, {"content-type":"text/html"})
    res.end(`Finished processing file: ${file}`);
  }).catch( err => {
    _responseWithError(new Error(`Error processing file: ${err.message}`), res)
  })
}

function _responseWithError(error: Error, res: express.Response) {
  console.log(error.message)

  res.writeHead(400, {"content-type":"text/html"})
  res.end(`Error processing file: ${error.message}`);
}

