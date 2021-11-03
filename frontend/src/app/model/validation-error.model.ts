/**
 * A validation error is a part of the response from a validation
 * request to the backend, where the field gets related to it's
 * error description
 */
export interface ValidationError {
  field: string;
  description: string;
}