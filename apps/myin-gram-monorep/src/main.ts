import { NestFactory } from '@nestjs/core';
import { AppModule } from './feature/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Service B (TCP) is listening on port ${process.env.PORT || 3000}`);
}
bootstrap();
