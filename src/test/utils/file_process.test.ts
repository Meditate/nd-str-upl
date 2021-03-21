import * as fileProcessing from '../../utils/file_processing'
import * as fileUpload from '../../utils/file_upload'
import * as constants from '../../common/constants'
import { PassThrough } from 'stream'
import { FileStreamToUpload } from '../../common/types'

const mockConstants = constants as {
  RESOLUTIONS: any
}

const mockFileStreamToUpload = (): FileStreamToUpload => {
  const fileStreamObject:FileStreamToUpload = {
    stream: new PassThrough(),
    fileNameWithExtension: 'test.test',
    fileName: 'test',
    fileExtension: 'test',
    contentType: 'test'
  }

  return fileStreamObject
}

afterEach(() => {    
  jest.clearAllMocks();
});

describe("processImage", () => {
  test("calls uploadStore ", () => {
    mockConstants.RESOLUTIONS = ['300', '1024', '2048']

    const spy = jest.spyOn(fileUpload, 'uploadToStore').mockImplementation(jest.fn().mockReturnValue(true));
    const fileStreamObject = mockFileStreamToUpload()

    fileProcessing.processImage(fileStreamObject);

    expect(spy).toHaveBeenCalledTimes(3)
  })
})

describe("processFile", () => {
  test("calls UploadStore", () => {
    const spy = jest.spyOn(fileUpload, 'uploadToStore').mockImplementation(jest.fn().mockReturnValue(true));
    const fileStreamObject = mockFileStreamToUpload()

    fileProcessing.processFile(fileStreamObject);

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
