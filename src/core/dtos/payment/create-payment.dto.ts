export class CreatePayment {
  invoice_id: string;
  reference_id: string;
  xendit_id: string;
  business_id: string;
  external_id: string = 'tnos-';
  authentication_id: string;
  token_id: string;
  card_info: string;
  status: string;
  amount: number;
  description: string;
  customer: string;
  items: string;
  actions: string;
  account_numbers: string;
  bank_code: string;
  merchant_code: string;
  is_closed: boolean;
  is_single_use: boolean;
  currency: string = 'IDR';
  payment_method: string;
  payment_channel: string;
  expiration_date: string;
  others: string;
  channel_code: string;
  mobile_number: string;
  status_pembayaran: string;

  generateRandomExternalId() {
    this.external_id += Math.random().toString(36).substring(7);
  }
  constructor() {
    this.generateRandomExternalId();
  }
}

export class CreateLink {
  account_mobile_number: string;
  card_expiry: string;
  card_last_four: string;
  channel_code: string;
  account_email: string;
  customer_id: string;
}
