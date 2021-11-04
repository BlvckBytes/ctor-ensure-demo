import { Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { CtorEnsureException } from 'ctor-ensure/lib';

@Catch(CtorEnsureException)
export class CtorEnsureExceptionFilter implements ExceptionFilter {
  catch(ex: CtorEnsureException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // Group errors by field-name
    const validationErrors = {};
    const fieldErrors = {};
    ex.errors.forEach((error) => {
      fieldErrors[error.field] = [].concat(
        ...(fieldErrors[error.field] || []),
        [error.description],
      );
    });
    validationErrors[ex.displayName] = fieldErrors;

    // Create a 400 response
    ctx.getResponse<Response>().status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      validationErrors,
    });
  }
}