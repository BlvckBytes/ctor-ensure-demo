import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CtorEnsureExceptionFilter } from './config/ctor-ensure.exception-filter';

// I'm just importing the model here, to execute the decorators
// in order to have them available for the validation endpoint
import './model/user.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Exception mapper
  app.useGlobalFilters(new CtorEnsureExceptionFilter());

  // Allow all CORS requests
  app.enableCors();

  await app.listen(3000);
}

bootstrap();
