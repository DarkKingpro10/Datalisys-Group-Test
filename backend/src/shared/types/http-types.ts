export interface HttpTypesI { code: number; type: string }

export const HttpTypes: Record<string, HttpTypesI> = {
  ERROR_PERMISSIONS_FAILS: { code: 401, type: 'UNAUTHORIZED' },
  FORBIDDEN: { code: 403, type: 'NOT_ALLOWED' },
  NOT_ALLOWED: { code: 403, type: 'NOT_ALLOWED' },
  NOT_FOUND: { code: 404, type: 'NOT_FOUND' },
  BAD_REQUEST: { code: 400, type: 'BAD_REQUEST' },
  INTERNAL_SERVER_ERROR: { code: 500, type: 'INTERNAL_SERVER_ERROR' },
  REQUIRED_AUTH_KEY: { code: 401, type: 'REQUIRED_AUTH_KEY' },
  INVALID_TOKEN: { code: 401, type: 'INVALID_TOKEN' },
  INVALID_INPUT: { code: 400, type: 'INVALID_INPUT' },
  INVALID_INPUT_FORMAT: { code: 400, type: 'INVALID_INPUT_FORMAT' },
  NOT_REGISTRATION: { code: 400, type: 'NOT_REGISTRATION' },
  INPUT_TO_LARGE: { code: 400, type: 'INPUT_TO_LARGE' },
  AUTHENTICATION_FAILED: { code: 401, type: 'AUTHENTICATION_FAILED' },
  CONFLICT: { code: 409, type: 'CONFLICT' },
  CREATED: { code: 201, type: 'CREATED' },
  OK: { code: 200, type: 'OK' },
  UNPROCESSABLE_ENTITY: { code: 422, type: 'UNPROCESSABLE_ENTITY' },
  MULTI_STATUS: { code: 207, type: 'MULTI_STATUS' },
}

export default HttpTypes
