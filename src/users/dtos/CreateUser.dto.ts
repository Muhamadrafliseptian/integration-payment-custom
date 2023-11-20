import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class CreateUser {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  no_telepon: string;
}
