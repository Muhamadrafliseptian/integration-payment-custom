import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';

export class CreateUser {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @Exclude()
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
