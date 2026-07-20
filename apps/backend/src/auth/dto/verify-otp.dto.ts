import { IsString, IsNotEmpty, Matches, IsOptional, MinLength, MaxLength, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+250[0-9]{9}$/, {
    message: 'phoneNumber must be a valid Rwandan number in format +250XXXXXXXXX',
  })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'otp is required' })
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'otp must be numeric' })
  otp!: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  preferredName?: string;
}
