import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WaterPlantDto {
  @ApiProperty({
    description: 'Quantité d\'eau utilisée pour l\'arrosage',
    example: '1L',
  })
  @IsString()
  @IsNotEmpty()
  quantity: string;

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
