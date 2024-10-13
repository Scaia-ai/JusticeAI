export class KeyValuePair {
  public constructor(init?: Partial<KeyValuePair>) {
    Object.assign(this, init);
  }

  key: any;
  value: any;
}
