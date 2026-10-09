import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanEntity } from './plan.entity';

// Registro de auditoría: desde qué dirección se creó cada plan
@Entity('plan_creation_log')
export class PlanCreationLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PlanEntity, { nullable: false, onDelete: 'CASCADE' })
  plan: PlanEntity;

  // null si la petición llegó por IPv6 pura
  @Column('varchar', { length: 15, nullable: true })
  ipv4: string | null;

  // null si el cliente no está en la red local del servidor (ver lookupMac)
  @Column('varchar', { length: 17, nullable: true })
  mac: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
