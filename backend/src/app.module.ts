import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => validationSchema.parse(env),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
