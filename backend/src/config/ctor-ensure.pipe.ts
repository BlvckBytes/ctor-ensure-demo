import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { fromObj } from 'ctor-ensure/lib';
import { isCtorEnsured } from 'ctor-ensure/lib/util';

@Injectable()
export class CtorEnsurePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!isCtorEnsured(metadata.metatype)) return value;
    return fromObj(metadata.metatype, value);
  }
}