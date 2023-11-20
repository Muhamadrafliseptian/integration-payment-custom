import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signin() {
    return { msg: 'im signin' };
  }
  signup() {
    return { msg: 'im signup' };
  }
}
