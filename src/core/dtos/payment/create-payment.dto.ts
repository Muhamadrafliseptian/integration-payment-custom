// import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreatePayment {
  // @IsNotEmpty()
  // @IsString()
  // public reference_id: string = 'tnos-';
  // @IsInt()
  // @IsString()
  // public amount: string;
  // @IsNotEmpty()
  // @IsString()
  // public customer: string;
  // @IsNotEmpty()
  // public currency: string;
  // generateRandomExternalId() {
  //   this.reference_id += Math.random().toString(36).substring(7);
  // }

  invoice_id: string;
  xendit_id: string;
  business_id: string;
  reference_id: string;
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
  country: string;
  payment_method: string;
  payment_channel: string;
  expiration_date: string;
  others: string;
}
