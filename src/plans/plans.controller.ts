import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { LikePlanDto } from './dto/like-plan.dto';
import { PlanQueryDto } from './dto/plan-query.dto';
import {
  PlanCreationInfo,
  PlanDetail,
  PlanSummary,
  PlansService,
} from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll(
    @Query() { userId }: PlanQueryDto,
    @Ip() ip: string,
  ): Promise<PlanSummary[]> {
    const plans = await this.plansService.findAll();
    await this.plansService.logQuery('list', ip, userId);
    return plans;
  }

  // Va antes de GET :id para que "creation-logs" no se tome como id de plan
  @Get('creation-logs')
  findCreationLogs(): Promise<PlanCreationInfo[]> {
    return this.plansService.findCreationLogs();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() { userId }: PlanQueryDto,
    @Ip() ip: string,
  ): Promise<PlanDetail> {
    // Solo se registran consultas de planes que existen (findOne lanza 404 si no)
    const plan = await this.plansService.findOne(id);
    await this.plansService.logQuery('detail', ip, userId, id);
    return plan;
  }

  @Post()
  create(@Body() dto: CreatePlanDto, @Ip() ip: string): Promise<PlanDetail> {
    return this.plansService.create(dto, ip);
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
