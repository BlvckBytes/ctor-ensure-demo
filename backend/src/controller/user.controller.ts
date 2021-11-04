import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { v4 } from 'uuid';
import UserModel from 'src/model/user.model';

@Controller('users')
export class UserController {

  // Simulates an in-memory DB
  users: UserModel[] = [];

  @Post()
  createUser(@Body() body: any) {
    // Create user with random UUID
    const user = UserModel.fromBody(body);
    user.id = v4();
    this.users.push(user);
  }

  @Get()
  listUsers() {
    return this.users;
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    // Create list copy with target ID removed
    const res = this.users.filter(it => it.id !== id);

    // Nothing removed, not found
    if (res.length === this.users.length)
      throw new HttpException(`There is no 'user' with the id '${id}'!`, HttpStatus.NOT_FOUND);

    // "Delete" from DB
    this.users = res;
  }
}