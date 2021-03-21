import stream from 'stream';
import AWS from 'aws-sdk';

var s3 = new AWS.S3(
  {
    endpoint: new AWS.Endpoint('http://localhost:4566'),
    s3ForcePathStyle: true
  }
);

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
