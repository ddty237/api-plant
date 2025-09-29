import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WaterPlantDto {
  @ApiProperty({
    description: 'Quantité d\'eau utilisée pour l\'arrosage en litres',
    example: 0.5,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  quantityInLiters: number;

  @ApiPropertyOptional({
    description: 'Date et heure de l\'arrosage (par défaut: maintenant)',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  wateredAt?: string;

  @ApiPropertyOptional({
    description: 'Notes sur cet arrosage',
    example: 'Terre très sèche, a bien absorbé l\'eau',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
