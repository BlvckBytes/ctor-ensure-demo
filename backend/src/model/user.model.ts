import { 
  CtorEnsure,
  ENSURE_ALPHANUM,
  ENSURE_ARRAYSIZEMIN,
  ENSURE_EMAIL,
  ENSURE_ENUM,
  ENSURE_INT,
  ENSURE_ISARRAY,
  ENSURE_MINMAXLEN,
  ENSURE_MINMAXNUMBER,
  ValidatedArg,
} from 'ctor-ensure';
import { Topic } from './topics.enum';

@CtorEnsure({
  displayname: 'user',
  multipleErrorsPerField: true,
})
export default class UserModel {
  constructor(
    public id: string,

    @ValidatedArg('username', [
      ENSURE_ALPHANUM(),
      ENSURE_MINMAXLEN(10, 30),
    ])
    public username: string,

    @ValidatedArg('email', [
      ENSURE_EMAIL(),
    ])
    public email: string,

    @ValidatedArg('age', [
      ENSURE_INT(),
      ENSURE_MINMAXNUMBER(18, 100),
    ])
    public age: number,

    @ValidatedArg('interests', [
      ENSURE_ISARRAY(true, true, true),
      ENSURE_ARRAYSIZEMIN(1),
      ENSURE_ENUM(Topic),
    ])
    public interests: Topic[],
  ) {}
}
