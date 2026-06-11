import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: config.getOrThrow('JWT_EXPIRES_IN') as '7d',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
