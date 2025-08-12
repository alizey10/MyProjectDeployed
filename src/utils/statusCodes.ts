

export enum APIStatusCode {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  ServerError = 500,
}

export const getStatusCode = (res: any): number | undefined => {
  return res?.response?.data?.statusCode || res?.data?.statusCode;
};

export const getMessage = (res: any): string => {
  return (
    res?.response?.data?.message ||
    res?.data?.message ||
    'Something went wrong.'
  );
};
