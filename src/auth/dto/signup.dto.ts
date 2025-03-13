import { IsEmail, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 5,
  })
  password: string;
}
