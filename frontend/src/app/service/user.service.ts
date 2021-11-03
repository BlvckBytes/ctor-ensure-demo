import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { User } from "../model/user.model";

@Injectable()
export class UserService {

  constructor (
    public http: HttpClient,
  ) {}

  /**
   * Get all existing users
   * @returns Array of users
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  /**
   * Create a new user
   * @param user User to create
   * @returns Void observable
   */
  createUser(user: Omit<User, 'id'>) {
    return this.http.post<void>(`${environment.apiUrl}/users`, user);
  }

  /**
   * Delete a user with a specific ID
   * @param id ID to delete
   * @returns Void observable
   */
  deleteUser(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }
}