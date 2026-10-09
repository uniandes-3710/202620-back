import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { PlanCreationLogEntity } from './plan-creation-log.entity';
import { PlanEntity } from './plan.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanEntity, PlanCreationLogEntity, UserEntity]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
