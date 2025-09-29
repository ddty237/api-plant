import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { WaterPlantDto } from './dto/water-plant.dto';
import { QueryPlantsDto } from './dto/query-plants.dto';
import type { ApiResponse as ApiResponseType } from '../common/interfaces/auth.interface';

@ApiTags('plants')
@ApiBearerAuth('JWT-auth')
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Créer une nouvelle plante',
    description: 'Permet à un utilisateur d\'ajouter une nouvelle plante à sa collection'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Plante créée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  async create(@Request() req: any, @Body() createPlantDto: CreatePlantDto): Promise<ApiResponseType> {
    const plant = await this.plantsService.create(req.user.sub, createPlantDto);
    
    return {
      success: true,
      message: 'Plante créée avec succès',
      data: plant,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Récupérer toutes les plantes de l\'utilisateur',
    description: 'Récupère la liste des plantes avec possibilité de filtrage et tri'
  })
  @ApiQuery({ name: 'search', required: false, description: 'Rechercher par nom ou espèce' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filtrer par statut actif' })
  @ApiQuery({ name: 'needsWatering', required: false, description: 'Plantes ayant besoin d\'eau' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Champ de tri' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Ordre de tri' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des plantes récupérée avec succès',
  })
  async findAll(@Request() req: any, @Query() queryDto: QueryPlantsDto): Promise<ApiResponseType> {
    const plants = await this.plantsService.findAll(req.user.sub, queryDto);
    
    return {
      success: true,
      message: 'Plantes récupérées avec succès',
      data: plants,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('needs-watering')
  @ApiOperation({ 
    summary: 'Récupérer les plantes ayant besoin d\'eau',
    description: 'Récupère les plantes dont la date de prochain arrosage est dépassée'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plantes ayant besoin d\'eau récupérées avec succès',
  })
  async getPlantsNeedingWater(@Request() req: any): Promise<ApiResponseType> {
    const plants = await this.plantsService.getPlantsNeedingWater(req.user.sub);
    
    return {
      success: true,
      message: 'Plantes ayant besoin d\'eau récupérées avec succès',
      data: plants,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Récupérer une plante par ID',
    description: 'Récupère les détails d\'une plante spécifique'
  })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plante récupérée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plante non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès non autorisé',
  })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponseType> {
    const plant = await this.plantsService.findOne(req.user.sub, id);
    
    return {
      success: true,
      message: 'Plante récupérée avec succès',
      data: plant,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: 'Récupérer les statistiques d\'une plante',
    description: 'Récupère les statistiques d\'arrosage et de suivi d\'une plante'
  })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques récupérées avec succès',
  })
  async getPlantStats(@Request() req: any, @Param('id') id: string): Promise<ApiResponseType> {
    const stats = await this.plantsService.getPlantStats(req.user.sub, id);
    
    return {
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/watering-history')
  @ApiOperation({ 
    summary: 'Récupérer l\'historique d\'arrosage d\'une plante',
    description: 'Récupère tous les enregistrements d\'arrosage d\'une plante'
  })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historique d\'arrosage récupéré avec succès',
  })
  async getWateringHistory(@Request() req: any, @Param('id') id: string): Promise<ApiResponseType> {
    const history = await this.plantsService.getWateringHistory(req.user.sub, id);
    
    return {
      success: true,
      message: 'Historique d\'arrosage récupéré avec succès',
      data: history,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/water')
  @ApiOperation({ 
    summary: 'Arroser une plante',
    description: 'Enregistre un arrosage pour une plante et met à jour ses informations'
  })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Arrosage enregistré avec succès',
  })
  async waterPlant(
    @Request() req: any,
    @Param('id') id: string,
    @Body() waterPlantDto: WaterPlantDto,
  ): Promise<ApiResponseType> {
    const result = await this.plantsService.waterPlant(req.user.sub, id, waterPlantDto);
    
    return {
      success: true,
      message: 'Arrosage enregistré avec succès',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Mettre à jour une plante',
    description: 'Met à jour les informations d\'une plante'
  })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plante mise à jour avec succès',
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ): Promise<ApiResponseType> {
    const plant = await this.plantsService.update(req.user.sub, id, updatePlantDto);
    
    return {
      success: true,
      message: 'Plante mise à jour avec succès',
      data: plant,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Supprimer une plante',
    description: 'Désactive une plante (suppression logique)'
  })
  @ApiParam({ name: 'id', description: 'ID de la plante' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plante supprimée avec succès',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponseType> {
    const plant = await this.plantsService.remove(req.user.sub, id);
    
    return {
      success: true,
      message: 'Plante supprimée avec succès',
      data: plant,
      timestamp: new Date().toISOString(),
    };
  }
}
