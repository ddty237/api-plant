import { ConfigService } from '@nestjs/config';

export const getMongoConfig = (configService: ConfigService): string => {
  const mongoUri = configService.get<string>('MONGODB_URI');
  
  if (mongoUri) {
    return mongoUri;
  }

  // Configuration par défaut pour MongoDB local
  const host = configService.get<string>('MONGODB_HOST', 'localhost');
  const port = configService.get<number>('MONGODB_PORT', 27017);
  const database = configService.get<string>('MONGODB_DATABASE', 'plant_db');
  const username = configService.get<string>('MONGODB_USERNAME');
  const password = configService.get<string>('MONGODB_PASSWORD');

  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
  }

  return `mongodb://${host}:${port}/${database}`;
};
