import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicinesModule } from './medicines/medicines.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from './reminders/reminders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DoseLogsModule } from './dose-logs/dose-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),

        autoLoadEntities: true,

        synchronize: process.env.NODE_ENV !== 'production',

        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    MedicinesModule,
    RemindersModule,
    NotificationsModule,
    DoseLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
