import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { SHORT_ID_LENGTH, shortId } from '../shared/short-id';
import { UserEntity } from '../users/user.entity';

@Entity()
export class PlanEntity {
  @PrimaryColumn({ length: SHORT_ID_LENGTH })
  id: string;

  // SQLite no hace cumplir el largo del varchar; el límite de 60 se valida en el DTO
  @Column({ length: 60 })
  name: string;

  @Column('text')
  description: string;

  @Column('int', { default: 0 })
  likes: number;

  @Column('real')
  estimatedPrice: number;

  // Duración estimada en minutos
  @Column('int')
  estimatedTime: number;

  @Column('text')
  recomendations: string;

  @Column()
  address: string;

  // URL de la imagen del plan
  @Column('text')
  image: string;

  // Todo plan tiene creador; si se borra el usuario se borran sus planes
  @ManyToOne(() => UserEntity, (user) => user.myPlans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  creator: UserEntity;

  @BeforeInsert()
  generateId() {
    this.id ??= shortId();
  }
}
