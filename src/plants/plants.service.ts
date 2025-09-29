import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plant, PlantDocument } from './entities/plant.entity';
import {
  WateringRecord,
  WateringRecordDocument,
} from './entities/watering-record.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { WaterPlantDto } from './dto/water-plant.dto';
import { QueryPlantsDto } from './dto/query-plants.dto';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name)
    private readonly plantModel: Model<PlantDocument>,
    @InjectModel(WateringRecord.name)
    private readonly wateringRecordModel: Model<WateringRecordDocument>,
  ) {}

  /**
   * Créer une nouvelle plante
   */
  async create(
    userId: string,
    createPlantDto: CreatePlantDto,
  ): Promise<PlantDocument> {
    const plantData = {
      ...createPlantDto,
      userId: new Types.ObjectId(userId),
      purchaseDate: new Date(createPlantDto.purchaseDate),
      wateringNeeds: {
        ...createPlantDto.wateringNeeds,
        lastWatered: createPlantDto.wateringNeeds.lastWatered
          ? new Date(createPlantDto.wateringNeeds.lastWatered)
          : new Date(),
        nextWatering: new Date(), // Sera calculé par le middleware
      },
    };

    const plant = new this.plantModel(plantData);
    return plant.save();
  }

  /**
   * Récupérer toutes les plantes d'un utilisateur avec filtres
   */
  async findAll(
    userId: string,
    queryDto: QueryPlantsDto,
  ): Promise<PlantDocument[]> {
    const filter: Record<string, any> = { userId: new Types.ObjectId(userId) };

    // Filtres
    if (queryDto.search) {
      filter.$or = [
        { name: { $regex: queryDto.search, $options: 'i' } },
        { species: { $regex: queryDto.search, $options: 'i' } },
      ];
    }

    if (queryDto.isActive !== undefined) {
      filter.isActive = queryDto.isActive;
    }

    if (queryDto.needsWatering) {
      filter['wateringNeeds.nextWatering'] = { $lte: new Date() };
    }

    // Tri
    const sortField = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder === 'desc' ? -1 : 1;
    const sort: Record<string, any> = {};

    if (sortField === 'nextWatering') {
      sort['wateringNeeds.nextWatering'] = sortOrder;
    } else {
      sort[sortField] = sortOrder;
    }

    return this.plantModel.find(filter).sort(sort).exec();
  }

  /**
   * Récupérer une plante par ID
   */
  async findOne(userId: string, plantId: string): Promise<PlantDocument> {
    const plant = await this.plantModel.findById(plantId).exec();
    
    if (!plant) {
      throw new NotFoundException('Plante non trouvée');
    }

    if (plant.userId.toString() !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette plante');
    }

    return plant;
  }

  /**
   * Mettre à jour une plante
   */
  async update(
    userId: string,
    plantId: string,
    updatePlantDto: UpdatePlantDto,
  ): Promise<PlantDocument> {
    const plant = await this.findOne(userId, plantId);

    const updateData: Record<string, any> = { ...updatePlantDto };

    if (updatePlantDto.purchaseDate) {
      updateData.purchaseDate = new Date(updatePlantDto.purchaseDate);
    }

    if (updatePlantDto.wateringNeeds) {
      updateData.wateringNeeds = {
        ...plant.wateringNeeds,
        ...updatePlantDto.wateringNeeds,
      };

      if (updatePlantDto.wateringNeeds.lastWatered) {
        updateData.wateringNeeds.lastWatered = new Date(
          updatePlantDto.wateringNeeds.lastWatered,
        );
      }
    }

    Object.assign(plant, updateData);
    return plant.save();
  }

  /**
   * Supprimer une plante (soft delete)
   */
  async remove(userId: string, plantId: string): Promise<PlantDocument> {
    const plant = await this.findOne(userId, plantId);
    plant.isActive = false;
    return plant.save();
  }

  /**
   * Arroser une plante
   */
  async waterPlant(
    userId: string,
    plantId: string,
    waterPlantDto: WaterPlantDto,
  ): Promise<{
    plant: PlantDocument;
    wateringRecord: WateringRecordDocument;
    message: string;
    wasEarly: boolean;
  }> {
    const plant = await this.findOne(userId, plantId);

    const wateredAt = waterPlantDto.wateredAt
      ? new Date(waterPlantDto.wateredAt)
      : new Date();

    const currentNextWatering = plant.nextWatering;
    const wasEarly = currentNextWatering && wateredAt < currentNextWatering;

    // Créer l'enregistrement d'arrosage
    const wateringRecord = new this.wateringRecordModel({
      plantId: new Types.ObjectId(plantId),
      userId: new Types.ObjectId(userId),
      wateredAt,
      quantityInLiters: waterPlantDto.quantityInLiters,
      notes: waterPlantDto.notes,
    });

    await wateringRecord.save();

    let message: string;
    let nextWatering: Date;

    if (wasEarly) {
      // Si arrosé en avance, garder la date prévue mais informer
      nextWatering = currentNextWatering;
      const daysEarly = Math.ceil((currentNextWatering.getTime() - wateredAt.getTime()) / (24 * 60 * 60 * 1000));
      message = `Plante arrosée ${daysEarly} jour(s) en avance. Prochain arrosage maintenu au ${currentNextWatering.toLocaleDateString('fr-FR')}.`;
    } else {
      // Si arrosé à temps ou en retard, calculer la prochaine date
      const frequency = plant.wateringNeeds.frequency;
      const frequencyUnit = plant.wateringNeeds.frequencyUnit;
      
      if (frequencyUnit === 'days') {
        nextWatering = new Date(wateredAt.getTime() + frequency * 24 * 60 * 60 * 1000);
      } else { // weeks
        nextWatering = new Date(wateredAt.getTime() + frequency * 7 * 24 * 60 * 60 * 1000);
      }

      // Ajuster selon l'heure préférée
      const preferredTime = plant.wateringNeeds.preferredTimeOfDay;
      if (preferredTime === 'morning') {
        nextWatering.setHours(8, 0, 0, 0);
      } else if (preferredTime === 'afternoon') {
        nextWatering.setHours(14, 0, 0, 0);
      } else { // evening
        nextWatering.setHours(18, 0, 0, 0);
      }

      message = `Plante arrosée avec succès. Prochain arrosage prévu le ${nextWatering.toLocaleDateString('fr-FR')}.`;
    }

    // Mettre à jour la plante
    plant.wateringNeeds.lastWatered = wateredAt;
    plant.nextWatering = nextWatering;
    await plant.save();

    return { plant, wateringRecord, message, wasEarly };
  }

  /**
   * Récupérer l'historique d'arrosage d'une plante
   */
  async getWateringHistory(
    userId: string,
    plantId: string,
  ): Promise<WateringRecordDocument[]> {
    await this.findOne(userId, plantId); // Vérifier l'accès

    return this.wateringRecordModel
      .find({ plantId: new Types.ObjectId(plantId) })
      .sort({ wateredAt: -1 })
      .exec();
  }

  /**
   * Récupérer les plantes qui ont besoin d'être arrosées
   */
  async getPlantsNeedingWater(userId: string): Promise<PlantDocument[]> {
    return this.plantModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        'wateringNeeds.nextWatering': { $lte: new Date() },
      })
      .sort({ 'wateringNeeds.nextWatering': 1 })
      .exec();
  }

  /**
   * Récupérer les statistiques d'arrosage d'une plante
   */
  async getPlantStats(
    userId: string,
    plantId: string,
  ): Promise<{
    totalWaterings: number;
    averageFrequency: number;
    lastWatered: Date | null;
    nextWatering: Date;
    streak: number;
  }> {
    const plant = await this.findOne(userId, plantId);

    const wateringRecords = await this.wateringRecordModel
      .find({ plantId: new Types.ObjectId(plantId) })
      .sort({ wateredAt: -1 })
      .exec();

    const totalWaterings = wateringRecords.length;
    const lastWatered = plant.wateringNeeds.lastWatered;
    const nextWatering = plant.wateringNeeds.nextWatering;

    // Calculer la fréquence moyenne
    let averageFrequency = plant.wateringNeeds.frequency;
    if (wateringRecords.length > 1) {
      const intervals: number[] = [];
      for (let i = 0; i < wateringRecords.length - 1; i++) {
        const diff = wateringRecords[i].wateredAt.getTime() - wateringRecords[i + 1].wateredAt.getTime();
        intervals.push(Math.ceil(diff / (1000 * 60 * 60 * 24))); // en jours
      }
      averageFrequency = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    // Calculer le streak (nombre de jours consécutifs d'arrosage respecté)
    let streak = 0;
    const expectedFrequency = plant.wateringNeeds.frequency;

    for (let i = 0; i < wateringRecords.length - 1; i++) {
      const current = wateringRecords[i].wateredAt;
      const previous = wateringRecords[i + 1].wateredAt;
      const daysDiff = Math.ceil((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= expectedFrequency + 1) { // Tolérance d'1 jour
        streak++;
      } else {
        break;
      }
    }

    return {
      totalWaterings,
      averageFrequency: Math.round(averageFrequency * 10) / 10,
      lastWatered,
      nextWatering,
      streak,
    };
  }

  /**
   * Récupérer les plantes nécessitant un arrosage immédiat (en retard)
   */
  async getPlantsOverdue(userId: string): Promise<PlantDocument[]> {
    const now = new Date();
    return this.plantModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        'wateringNeeds.reminderEnabled': true,
        'wateringNeeds.nextWatering': { $lt: now },
      })
      .sort({ 'wateringNeeds.nextWatering': 1 })
      .exec();
  }

  /**
   * Récupérer les plantes à arroser bientôt (dans les prochaines 24h)
   */
  async getPlantsUpcoming(userId: string): Promise<PlantDocument[]> {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return this.plantModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        'wateringNeeds.reminderEnabled': true,
        'wateringNeeds.nextWatering': { 
          $gte: now,
          $lte: tomorrow 
        },
      })
      .sort({ 'wateringNeeds.nextWatering': 1 })
      .exec();
  }

  /**
   * Récupérer toutes les notifications d'arrosage pour un utilisateur
   */
  async getWateringNotifications(userId: string): Promise<{
    overdue: PlantDocument[];
    upcoming: PlantDocument[];
    count: {
      overdue: number;
      upcoming: number;
      total: number;
    };
  }> {
    const [overdue, upcoming] = await Promise.all([
      this.getPlantsOverdue(userId),
      this.getPlantsUpcoming(userId),
    ]);

    return {
      overdue,
      upcoming,
      count: {
        overdue: overdue.length,
        upcoming: upcoming.length,
        total: overdue.length + upcoming.length,
      },
    };
  }

  /**
   * Récupérer les plantes en retard d'arrosage
   */
  private async getPlantsOverdue(userId: string): Promise<PlantDocument[]> {
    const now = new Date();
    
    return this.plantModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
      'wateringNeeds.reminderEnabled': true,
      nextWatering: { $lt: now }, // Date de prochain arrosage dépassée
    }).exec();
  }

  /**
   * Récupérer les plantes à arroser bientôt (dans les 8 prochaines heures)
   */
  private async getPlantsUpcoming(userId: string): Promise<PlantDocument[]> {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 heures à partir de maintenant
    
    return this.plantModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
      'wateringNeeds.reminderEnabled': true,
      nextWatering: { 
        $gte: now, // Pas encore en retard
        $lte: in8Hours // Mais dans les 8 prochaines heures
      },
    }).exec();
  }

  /**
   * Marquer une notification comme lue (snooze pour 1 heure)
   */
  async snoozeNotification(userId: string, plantId: string): Promise<PlantDocument> {
    const plant = await this.findOne(userId, plantId);
    
    // Décaler la prochaine notification d'1 heure
    const nextWatering = new Date(plant.wateringNeeds.nextWatering);
    nextWatering.setHours(nextWatering.getHours() + 1);
    
    plant.wateringNeeds.nextWatering = nextWatering;
    return plant.save();
  }

  /**
   * Désactiver les notifications pour une plante
   */
  async disableNotifications(userId: string, plantId: string): Promise<PlantDocument> {
    const plant = await this.findOne(userId, plantId);
    plant.wateringNeeds.reminderEnabled = false;
    return plant.save();
  }

  /**
   * Activer les notifications pour une plante
   */
  async enableNotifications(userId: string, plantId: string): Promise<PlantDocument> {
    const plant = await this.findOne(userId, plantId);
    plant.wateringNeeds.reminderEnabled = true;
    return plant.save();
  }

  /**
   * Formater la quantité d'eau en texte lisible
   */
  formatWaterQuantity(quantityInLiters: number): string {
    if (quantityInLiters >= 1) {
      return `${quantityInLiters}L`;
    } else {
      return `${Math.round(quantityInLiters * 1000)}ml`;
    }
  }

  /**
   * Convertir une quantité textuelle en litres
   */
  parseWaterQuantity(quantity: string): number {
    const lowerQuantity = quantity.toLowerCase().trim();
    
    if (lowerQuantity.includes('ml')) {
      const ml = parseFloat(lowerQuantity.replace('ml', ''));
      return ml / 1000;
    } else if (lowerQuantity.includes('l')) {
      return parseFloat(lowerQuantity.replace('l', ''));
    } else {
      // Assume it's already in liters if no unit
      return parseFloat(lowerQuantity);
    }
  }
}
