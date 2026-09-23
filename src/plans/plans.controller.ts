import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { LikePlanDto } from './dto/like-plan.dto';
import { PlanDetail, PlanSummary, PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll(): Promise<PlanSummary[]> {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PlanDetail> {
    return this.plansService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePlanDto): Promise<PlanDetail> {
    return this.plansService.create(dto);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  like(@Param('id') id: string, @Body() dto: LikePlanDto): Promise<PlanDetail> {
    return this.plansService.like(id, dto.userId);
  }

  @Post(':id/unlike')
  @HttpCode(HttpStatus.OK)
  unlike(
    @Param('id') id: string,
    @Body() dto: LikePlanDto,
  ): Promise<PlanDetail> {
    return this.plansService.unlike(id, dto.userId);
  }
}
