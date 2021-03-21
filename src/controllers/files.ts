import express from 'express';
import { processImage, processFile, createSizeStream, createFileStream } from '../utils/file_processing'
import { AVAILABLE_EXTENSIONS } from '../common/constants'

export async function uploadFile (req: express.Request, res: express.Response): Promise<any> {
  let contentType = req.get('Content-Type') || ''
  let original_file_name_splitted = req.params.file_name.split('.')

  if(!contentType) {
    _respondWith(400, 'Invalid Content-Type', res)
  }

  if(!original_file_name_splitted[0]) {
    _respondWith(400, 'Invalid file name', res)
  }

  if(!AVAILABLE_EXTENSIONS.includes(original_file_name_splitted[1])) {
    _respondWith(
      400,
      `Invalid file extension: ${original_file_name_splitted[1]}, available extensions are: ${AVAILABLE_EXTENSIONS}`,
      res
    )
  }

  let sizeStream = createSizeStream(req, (err: Error) => _respondWith(400, err.message, res))
  let fileStreamObject = createFileStream(req)

  req.pipe(sizeStream)
  req.pipe(fileStreamObject.stream)

  let uploadPromise =
    fileStreamObject.contentType.includes('image') ? processImage(fileStreamObject) : processFile(fileStreamObject)

  uploadPromise.then((file) => {
    _respondWith(200, `Finished processing file: ${file}`, res)
  }).catch( err => {
    _respondWith(400, err.message, res)
  })
}

function _respondWith(status: number, message: string, res: express.Response) {
  res.writeHead(status, {"content-type":"application/json"})

  let response;

  if(status == 400) {
    response = {
      data: '',
      error: message
    }
  } else {
    response = {
      data: message,
      error: ''
    }
  }

  res.end(
    JSON.stringify(response)
  );
}
