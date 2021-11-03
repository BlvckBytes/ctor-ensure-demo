import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CtorEnsureExceptionFilter } from './config/ctor-ensure.exception-filter';

// I'm just importing the model here, to execute the decorators
// for the validation endpoint to have the models registered
import './model/user.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CtorEnsureExceptionFilter());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
