/**
 * A user is a defined model in the backend, that has the
 * defined data-structure and will be used for I/O
 * 
 * NOTE: All validation happens in the backend only!
 */
export interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  interests: string[];
}