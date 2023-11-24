export class TestPaymentsDto {
  external_id: string = 'tnos-test-payments-';
  invoice_url: string;
  user_id: string;
  status: string;
  currency: string = 'IDR';
  amount: number;

  generateRandomExternalId() {
    this.external_id += Math.random().toString(36).substring(7);
  }
  constructor() {
    this.generateRandomExternalId();
  }
}
