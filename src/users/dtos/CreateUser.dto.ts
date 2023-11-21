import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class CreateUser {
  @IsNotEmpty()
  @IsString()
  public username: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public name: string;

  @IsNotEmpty()
  public no_telepon: string;

  @IsNotEmpty()
  public password: string;
}
