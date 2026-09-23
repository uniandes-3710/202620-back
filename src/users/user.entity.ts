import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanEntity } from '../plans/plan.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // Guarda el hash generado con hashPassword (src/shared/password.ts), nunca el texto plano
  @Column()
  password: string;

  @OneToMany(() => PlanEntity, (plan) => plan.creator)
  myPlans: PlanEntity[];

  // Planes a los que el usuario dio like (tabla intermedia user_likes)
  @ManyToMany(() => PlanEntity)
  @JoinTable({
    name: 'user_likes',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'planId' },
  })
  myLikes: PlanEntity[];
}
