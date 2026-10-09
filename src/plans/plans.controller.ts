import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { LikePlanDto } from './dto/like-plan.dto';
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
  findAll(): Promise<PlanSummary[]> {
    return this.plansService.findAll();
  }

  // Va antes de GET :id para que "creation-logs" no se tome como id de plan
  @Get('creation-logs')
  findCreationLogs(): Promise<PlanCreationInfo[]> {
    return this.plansService.findCreationLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PlanDetail> {
    return this.plansService.findOne(id);
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
