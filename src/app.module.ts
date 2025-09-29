import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlantsModule } from './plants/plants.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { getMongoConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Base de données MongoDB avec Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: getMongoConfig(configService),
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),
    
    // Modules fonctionnels
        AuthModule,
        UsersModule,
        PlantsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global pour JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Validation globale
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
