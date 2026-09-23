import { IsUUID } from 'class-validator';

export class LikePlanDto {
  // Id del usuario que da el like
  @IsUUID()
  userId: string;
}
