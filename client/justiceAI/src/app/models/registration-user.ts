import { Base } from './base';

export class RegistrationUser extends Base {
  email: string;
  username: string;
  firstName: string;
  lastname: string;
  password: string;
  salt: string;
}
