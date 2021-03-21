import { uploadFile } from '../../controllers/files'
import * as constants from '../../common/constants'
import { Request, Response } from 'express'
import { RequestMock, ResponseMock } from '../../common/types'

const mockConstants = constants as { AVAILABLE_EXTENSIONS: any }

const mockResponse = () => {
  const res: ResponseMock = {
    writeHead: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };

  return res;
}

const mockRequest = (contentType: string, params: any) => {
  const req:RequestMock = {
    get: jest.fn().mockReturnValue(contentType),
    params: params,
    pipe: jest.fn().mockReturnValue({}),
  };

  return req;
}

test('with empty file name', async () => {
  const res = mockResponse();
  const req = mockRequest('image/png', { file_name: '' });

  const expectedResponse = {
    data: '',
    error: 'Invalid file name'
  }

  await uploadFile(req as Request, res as Response)

  expect(res.writeHead).toBeCalledWith(
    400,
    {"content-type":"application/json"}
  );
  expect(res.end).toBeCalledWith(
    JSON.stringify(expectedResponse)
  );
});

test('with empty contentType', async () => {
  const res = mockResponse();
  const req = mockRequest('', { file_name: '' });

  const expectedResponse = {
    data: '',
    error: 'Invalid Content-Type'
  }

  await uploadFile(req as Request, res as Response)

  expect(res.writeHead).toBeCalledWith(
    400,
    {"content-type":"application/json"}
  );
  expect(res.end).toBeCalledWith(
    JSON.stringify(expectedResponse)
  );
});

test('with incorrect extension', async () => {
  mockConstants.AVAILABLE_EXTENSIONS = ['png']

  const res = mockResponse();
  const req = mockRequest('image/png', { file_name: 'text.txt' });

  const expectedResponse = {
    data: '',
    error: 'Invalid file extension: txt, available extensions are: png'
  }

  await uploadFile(req as Request, res as Response)

  expect(res.writeHead).toBeCalledWith(
    400,
    {"content-type":"application/json"}
  );
  expect(res.end).toBeCalledWith(
    JSON.stringify(expectedResponse)
  );
});
