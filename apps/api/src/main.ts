import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Agrega api a todas las rutas
  app.setGlobalPrefix('api');
  //permite que la página en el puerto 5173 le haga peticiones al puerto 3000
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //ignora campos que el DTO no declara
      forbidNonWhitelisted: true, //responde con error 400 si llegan campos de más.
      transform: true, //transforma lo que lleva (el body) en una instacia de la clase DTO
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
