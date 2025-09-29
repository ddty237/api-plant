import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WateringNeedsDto {
  @ApiProperty({
    description: 'Quantité d\'eau nécessaire en litres',
    example: 0.5,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  quantityInLiters: number;

  @ApiProperty({
    description: 'Fréquence d\'arrosage',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  frequency: number;

  @ApiPropertyOptional({
    description: 'Unité de fréquence',
    example: 'days',
    enum: ['days', 'weeks'],
    default: 'days',
  })
  @IsOptional()
  @IsEnum(['days', 'weeks'])
  frequencyUnit?: 'days' | 'weeks';

  @ApiPropertyOptional({
    description: 'Heure préférée pour l\'arrosage',
    example: 'morning',
    enum: ['morning', 'afternoon', 'evening'],
    default: 'morning',
  })
  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening'])
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';

  @ApiPropertyOptional({
    description: 'Activer les rappels d\'arrosage',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

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
