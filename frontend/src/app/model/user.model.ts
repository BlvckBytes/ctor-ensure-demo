/**
 * A user is a defined model in the backend, that has the
 * defined data-structure and will be used for I/O
 */
export interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  interests: string[];
}