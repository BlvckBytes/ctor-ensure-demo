import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CtorEnsureExceptionFilter } from './config/ctor-ensure.exception-filter';
import { CtorEnsurePipe } from './config/ctor-ensure.pipe';

// I'm just importing the model here, to execute the decorators
// in order to have them available for the validation endpoint
import './model/user.model';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Exception mapper
  app.useGlobalFilters(new CtorEnsureExceptionFilter());

  // CtorEnsure pipe for automated body parsing
  app.useGlobalPipes(new CtorEnsurePipe());

  // Allow all CORS requests
  app.enableCors();

  await app.listen(3000);
}

bootstrap();
