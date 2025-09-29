import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlantDocument = Plant & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: any) {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Plant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  species: string;

  @Prop({ required: true })
  purchaseDate: Date;

  @Prop({ trim: true })
  image?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  // Besoins en eau
  @Prop({
    type: {
      quantityInLiters: { type: Number, required: true }, // Quantité en litres (ex: 0.5 pour 500ml, 1 pour 1L)
      frequency: { type: Number, required: true }, // en jours
      frequencyUnit: { type: String, enum: ['days', 'weeks'], default: 'days' }, // unité de fréquence
      lastWatered: { type: Date, default: Date.now },
      nextWatering: { type: Date, required: true },
      preferredTimeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        default: 'morning',
      }, // Heure préférée
      reminderEnabled: { type: Boolean, default: true }, // Activer les rappels
    },
    required: true,
  })
  wateringNeeds: {
    quantityInLiters: number;
    frequency: number;
    frequencyUnit: 'days' | 'weeks';
    lastWatered: Date;
    nextWatering: Date;
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
    reminderEnabled: boolean;
  };

  @Prop({ trim: true })
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;

  // Date du prochain arrosage (calculée automatiquement)
  @Prop({ type: Date })
  nextWatering: Date;

  // Timestamps automatiques
  createdAt?: Date;
  updatedAt?: Date;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);

// Index pour optimiser les requêtes par utilisateur
PlantSchema.index({ userId: 1 });
PlantSchema.index({ 'wateringNeeds.nextWatering': 1 });
PlantSchema.index({ nextWatering: 1 }); // Index pour la propriété racine

// Middleware pour calculer la prochaine date d'arrosage avec précision
PlantSchema.pre<PlantDocument>('save', function (next) {
  if (
    this.isModified('wateringNeeds.lastWatered') ||
    this.isModified('wateringNeeds.frequency') ||
    this.isModified('wateringNeeds.frequencyUnit') ||
    this.isModified('wateringNeeds.preferredTimeOfDay')
  ) {
    const lastWatered = new Date(this.wateringNeeds.lastWatered);
    const nextWatering = new Date(lastWatered);

    // Calculer la prochaine date selon l'unité
    if (this.wateringNeeds.frequencyUnit === 'weeks') {
      nextWatering.setDate(
        lastWatered.getDate() + this.wateringNeeds.frequency * 7,
      );
    } else {
      nextWatering.setDate(
        lastWatered.getDate() + this.wateringNeeds.frequency,
      );
    }

    // Définir l'heure selon la préférence
    switch (this.wateringNeeds.preferredTimeOfDay) {
      case 'morning':
        nextWatering.setHours(8, 0, 0, 0); // 8h00
        break;
      case 'afternoon':
        nextWatering.setHours(14, 0, 0, 0); // 14h00
        break;
      case 'evening':
        nextWatering.setHours(18, 0, 0, 0); // 18h00
        break;
      default:
        nextWatering.setHours(8, 0, 0, 0); // Par défaut le matin
    }

    this.wateringNeeds.nextWatering = nextWatering;
    this.nextWatering = nextWatering; // Synchroniser avec la propriété racine
  }
  next();
});
