import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { PlanEntity } from './plan.entity';

export type PlanQueryAction = 'list' | 'detail';

// Registro de auditoría: desde qué dirección se consultan los planes (GET /plans y GET /plans/:id)
@Entity('plan_query_log')
export class PlanQueryLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 6 })
  action: PlanQueryAction;

  // Solo en consultas de detalle
  @ManyToOne(() => PlanEntity, { nullable: true, onDelete: 'CASCADE' })
  plan: PlanEntity | null;

  // null si no se envió userId o el usuario no está registrado
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  user: UserEntity | null;

  // null si la petición llegó por IPv6 pura
  @Column('varchar', { length: 15, nullable: true })
  ipv4: string | null;

  // null si el cliente no está en la red local del servidor (ver lookupMac)
  @Column('varchar', { length: 17, nullable: true })
  mac: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
