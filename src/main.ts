import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { AppModule } from './app.module';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

async function bootstrap() {
  const app: INestMicroservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      logger: false,
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50051',
        package: 'auth',
        protoPath: join(__dirname, 'lib/proto/auth.proto'),
      },
    });

  const logger = app.get(Logger);

  signalsNames.forEach((signalName) =>
    process.on(signalName, (signal) => {
      logger.log(`Retrieved signal: ${signal}, application terminated`);
      process.exit(0);
    }),
  );

  process.on('uncaughtException', (error: Error) => {
    logger.error({ err: error });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Promise Rejection, reason: ${reason}`);
    promise.catch((err: Error) => {
      logger.error({ err });
      process.exit(1);
    });
  });
  await app.listen(() =>
    logger.log(`Microservice listening on port:: ${50051}`),
  );
}
bootstrap();
