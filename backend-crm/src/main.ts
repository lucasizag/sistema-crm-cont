import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitamos CORS para que cualquiera pueda pedir datos (por ahora, para facilitar)
  app.enableCors(); 

  // Usamos el puerto que nos de la nube O el 3000
  await app.listen(process.env.PORT || 3000);
}
bootstrap();