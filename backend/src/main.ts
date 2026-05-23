import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeDatabase } from './database/database.init';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const logger = new LoggerService();

  try {
    // Inicializar banco de dados
    logger.log('Inicializando banco de dados...');
    initializeDatabase();

    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    
    // Usar logger customizado
    app.useLogger(logger);
    
    // Habilitar validação global
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));
    
    // Habilitar exception filter global
    app.useGlobalFilters(new HttpExceptionFilter());
    
    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Cell Shop API')
      .setDescription('API para loja de capas de celular')
      .setVersion('1.0')
      .addTag('products', 'Operações com produtos')
      .addTag('checkout', 'Operações de checkout')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    const port = process.env.PORT ?? 3000;
    
    // Configurar CORS
    const corsOptions: CorsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
      credentials: false,
    };
    app.enableCors(corsOptions);
    
    await app.listen(port);
    
    logger.log(`Aplicação iniciada com sucesso na porta ${port}`, 'Bootstrap');
    logger.log(`Swagger documentation disponível em: http://localhost:${port}/api`, 'Bootstrap');
  } catch (error) {
    logger.error('Erro ao inicializar a aplicação', error.stack, 'Bootstrap');
    process.exit(1);
  }
}
bootstrap();
