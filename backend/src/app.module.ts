import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { ValidationController } from './controller/validation.controller';

@Module({
  imports: [],
  controllers: [
    ValidationController,
    UserController,
  ],
})
export class AppModule {}
