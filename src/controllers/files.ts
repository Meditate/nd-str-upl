import express from 'express';
import sharp from 'sharp';
import { uploadToStore } from '../utils'
import { FileStreamToUpload } from '../common/types'

const AVAILABLE_EXTENSIONS = process.env.AVAILABLE_EXTENSIONS?.split(',') || []
const RESOLUTIONS = process.env.RESOLUTIONS?.split(',') || []

export async function uploadFile (req: express.Request, res: express.Response): Promise<any> {
  let contentType = req.get('Content-Type') || ''
  let original_file_name_splitted = req.params.file_name.split('.')

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

  if (contentType && contentType.includes('image')) {
    _processImage(fileStreamToUpload)
  } else {
    uploadToStore(fileStreamToUpload.stream, fileStreamToUpload.fileNameWithExtension)
      .then((response) => {
        console.log(response);
      }).catch((err) => {
        console.log(err)
      })
  }

  req.on('end', () => {
    res.writeHead(200, {"content-type":"text/html"})
    res.end('Finished processing file');
  })
}

async function _processImage(imageStream: FileStreamToUpload) {
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

  Promise.all(promises).then( values => {
    console.log(values);
  }).catch( error => {
    console.log(error)
  })
}
