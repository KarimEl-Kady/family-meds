import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  dosagePerIntake?: number;

  @IsArray()
  @ArrayMinSize(1)
  scheduleTimes: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
