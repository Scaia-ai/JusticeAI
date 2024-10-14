import { Base } from './base';
import { Chat } from './chat';

export class Case extends Base {
  name: string;
  number: string;
  chat: Chat[];

}
