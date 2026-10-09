import { IsOptional, IsUUID } from 'class-validator';

export class PlanQueryDto {
  // Id del usuario que consulta; opcional, solo se usa para el registro de consultas
  @IsOptional()
  @IsUUID()
  userId?: string;
}
