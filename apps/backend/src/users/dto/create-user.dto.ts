import { IsString, IsNotEmpty, Matches, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Matches(/^\+250[0-9]{9}$/, {
    message: 'phoneNumber must be a valid Rwandan number in format +250XXXXXXXXX',
  })
  phoneNumber!: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  preferredName?: string;
}
