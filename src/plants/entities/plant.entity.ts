import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlantDocument = Plant & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
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
      quantity: { type: String, required: true }, // ex: "1L", "500ml"
      frequency: { type: Number, required: true }, // en jours
      lastWatered: { type: Date, default: Date.now },
      nextWatering: { type: Date, required: true }
    },
    required: true
  })
  wateringNeeds: {
    quantity: string;
    frequency: number;
    lastWatered: Date;
    nextWatering: Date;
  };

  @Prop({ trim: true })
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;

  // Timestamps automatiques
  createdAt?: Date;
  updatedAt?: Date;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);

// Index pour optimiser les requêtes par utilisateur
PlantSchema.index({ userId: 1 });
PlantSchema.index({ 'wateringNeeds.nextWatering': 1 });

// Middleware pour calculer la prochaine date d'arrosage
PlantSchema.pre<PlantDocument>('save', function(next) {
  if (this.isModified('wateringNeeds.lastWatered') || this.isModified('wateringNeeds.frequency')) {
    const lastWatered = new Date(this.wateringNeeds.lastWatered);
    const nextWatering = new Date(lastWatered);
    nextWatering.setDate(lastWatered.getDate() + this.wateringNeeds.frequency);
    this.wateringNeeds.nextWatering = nextWatering;
  }
  next();
});
