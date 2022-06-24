import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        timestamp: stdTimeFunctions.isoTime,
        level: process.env.NODE_ENV !== 'production' ? 'trace' : 'info',
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      },
    }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
