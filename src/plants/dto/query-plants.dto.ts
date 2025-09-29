import { IsOptional, IsString, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPlantsDto {
  @ApiPropertyOptional({
    description: 'Rechercher par nom ou espèce',
    example: 'monstera',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut actif',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer les plantes qui ont besoin d\'être arrosées',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  needsWatering?: boolean;

  @ApiPropertyOptional({
    description: 'Trier par',
    enum: ['name', 'species', 'purchaseDate', 'nextWatering', 'createdAt'],
    example: 'nextWatering',
  })
  @IsOptional()
  @IsIn(['name', 'species', 'purchaseDate', 'nextWatering', 'createdAt'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
