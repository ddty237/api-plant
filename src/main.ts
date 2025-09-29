import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration CORS pour l'intégration frontend
  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL', 'http://localhost:4200'),
      'http://localhost:3000', // Pour les tests
      'http://localhost:8080', // Alternative
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Préfixe global pour l'API
  app.setGlobalPrefix('api/v1');

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Plant API')
    .setDescription('API REST pour la gestion d\'une application de plantes avec authentification complète')
    .setVersion('1.0.0')
    .addTag('auth', 'Endpoints d\'authentification')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('health', 'Vérification de l\'état du système')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Serveur de développement')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Plant API Documentation',
    customfavIcon: '🌱',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #22c55e }
    `,
  });

  // Validation globale (déjà configurée dans app.module.ts mais on peut la redéfinir ici)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🌱 Plant API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health Check: http://localhost:${port}/api/v1/health`);
  console.log(`📋 API Base URL: http://localhost:${port}/api/v1`);
}
bootstrap();
