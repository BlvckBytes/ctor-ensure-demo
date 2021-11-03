import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { validateCtor } from 'ctor-ensure/lib';

@Controller('validate')
export class ValidationController {

  @Post(':name')
  @HttpCode(200)
  validateModel(
    @Param('name') name: string,
    @Body() body: any,
  ) {
    const res = validateCtor(name, body);

    if (res === null)
      throw new BadRequestException('Model not found!');

    return res;
  }
}
