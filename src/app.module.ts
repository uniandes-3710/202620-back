import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlansModule } from './plans/plans.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Carga .env en process.env (SEED, DB_PATH, UPLOADS_DIR, PORT...)
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const database = process.env.DB_PATH ?? 'data/app.sqlite';
        // better-sqlite3 no crea la carpeta si no existe
        if (database !== ':memory:') {
          mkdirSync(dirname(database), { recursive: true });
        }
        return {
          type: 'better-sqlite3',
          database,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    UsersModule,
    PlansModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
