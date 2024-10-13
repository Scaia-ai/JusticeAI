import { Base } from './base';

export class OrderQuestion extends Base {
  question: string;
  orderId: number;
  chatHistory: [][];
}
