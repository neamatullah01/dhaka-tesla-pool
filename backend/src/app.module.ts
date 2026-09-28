import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ZonesModule } from './modules/zones/zones.module.js';
import { DriverModule } from './modules/driver/driver.module.js';
import { FaresModule } from './modules/fares/fares.module.js';
import { RidesModule } from './modules/rides/rides.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => validationSchema.parse(env),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ZonesModule,
    DriverModule,
    FaresModule,
    RidesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
