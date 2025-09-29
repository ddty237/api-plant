import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WateringNeedsDto {
  @ApiProperty({
    description: 'Quantité d\'eau nécessaire',
    example: '1L',
  })
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiProperty({
    description: 'Fréquence d\'arrosage en jours',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  frequency: number;

  @ApiPropertyOptional({
    description: 'Date du dernier arrosage',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  lastWatered?: string;
}

export class CreatePlantDto {
  @ApiProperty({
    description: 'Nom de la plante',
    example: 'Mon Monstera',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Espèce de la plante',
    example: 'Monstera Deliciosa',
  })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiProperty({
    description: 'Date d\'achat de la plante',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  purchaseDate: string;

  @ApiPropertyOptional({
    description: 'URL de l\'image de la plante',
    example: 'https://example.com/monstera.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Besoins en eau de la plante',
    type: WateringNeedsDto,
  })
  @ValidateNested()
  @Type(() => WateringNeedsDto)
  wateringNeeds: WateringNeedsDto;

  @ApiPropertyOptional({
    description: 'Notes supplémentaires sur la plante',
    example: 'Aime la lumière indirecte',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
