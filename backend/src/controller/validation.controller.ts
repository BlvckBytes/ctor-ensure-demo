import { BadRequestException, Body, Controller, HttpCode, Param, Post, Query } from '@nestjs/common';
import { UnknownLanguageException, validateCtor } from 'ctor-ensure/lib';

@Controller('validate')
export class ValidationController {

  @Post(':name')
  @HttpCode(200)
  validateModel(
    @Param('name') name: string,
    @Query('lang') lang = '',
    @Body() body: any,
  ) {
    try {
      const res = validateCtor(name, body, lang);

      // This model has not been registered using @CtorEnsure
      if (res === null)
        throw new BadRequestException('Model not found!');

      return res;
    } catch (e: any) {
      if (e instanceof UnknownLanguageException)
        throw new BadRequestException('Language not found!');
      throw e;
    }
  }
}
