import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Matches(/^\+250[0-9]{9}$/, {
    message: 'phoneNumber must be a valid Rwandan number in format +250XXXXXXXXX',
  })
  phoneNumber!: string;
}
