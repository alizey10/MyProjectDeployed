export const getStatusCode = res => res?.response?.data?.statusCode || res?.data?.statusCode
export const getMessage = res => res?.response?.data?.message || res?.data?.message || 'Something went wrong.'
export const HttpStatus = Object.freeze({
  OK: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  InternalServerError: 500
})
