import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WateringRecordDocument = WateringRecord & Document;

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
export class WateringRecord {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Plant' })
  plantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  wateredAt: Date;

  @Prop({ required: true })
  quantityInLiters: number; // Quantité en litres (ex: 0.5, 1.0, 2.5)

  @Prop({ trim: true })
  notes?: string;

  // Timestamps automatiques
  createdAt?: Date;
  updatedAt?: Date;
}

export const WateringRecordSchema = SchemaFactory.createForClass(WateringRecord);

// Index pour optimiser les requêtes
WateringRecordSchema.index({ plantId: 1, wateredAt: -1 });
WateringRecordSchema.index({ userId: 1, wateredAt: -1 });
