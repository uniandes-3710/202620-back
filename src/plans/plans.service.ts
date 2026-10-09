import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { toBogotaIso } from '../shared/bogota-time';
import { resolveClientAddress } from '../shared/client-address';
import { UserEntity } from '../users/user.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanCreationLogEntity } from './plan-creation-log.entity';
import { PlanQueryAction, PlanQueryLogEntity } from './plan-query-log.entity';
import { PlanEntity } from './plan.entity';

export type PlanSummary = Pick<
  PlanEntity,
  'id' | 'name' | 'likes' | 'estimatedPrice' | 'address' | 'image'
> & {
  creator: Pick<UserEntity, 'id' | 'name'>;
};

export type PlanCreationInfo = {
  planId: string;
  userId: string;
  userName: string;
  ip: string | null;
  // Hora de Bogotá (UTC-5)
  createdAt: string;
};

export type PlanDetail = Omit<PlanEntity, 'creator' | 'generateId'> & {
  creator: Pick<UserEntity, 'name' | 'userName'>;
};

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly plansRepository: Repository<PlanEntity>,
    @InjectRepository(PlanCreationLogEntity)
    private readonly creationLogsRepository: Repository<PlanCreationLogEntity>,
    @InjectRepository(PlanQueryLogEntity)
    private readonly queryLogsRepository: Repository<PlanQueryLogEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<PlanSummary[]> {
    return this.plansRepository.find({
      relations: { creator: true },
      // Del creador solo se expone id y name (nunca email ni password)
      select: {
        id: true,
        name: true,
        likes: true,
        estimatedPrice: true,
        address: true,
        image: true,
        creator: { id: true, name: true },
      },
    });
  }

  /** Registro de creación de cada plan, del más reciente al más antiguo. */
  async findCreationLogs(): Promise<PlanCreationInfo[]> {
    const logs = await this.creationLogsRepository.find({
      relations: { plan: { creator: true } },
      select: {
        id: true,
        ipv4: true,
        createdAt: true,
        plan: { id: true, creator: { id: true, name: true } },
      },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return logs.map(({ plan, ipv4, createdAt }) => ({
      planId: plan.id,
      userId: plan.creator.id,
      userName: plan.creator.name,
      ip: ipv4,
      createdAt: toBogotaIso(createdAt),
    }));
  }

  async findOne(id: string): Promise<PlanDetail> {
    const plan = await this.plansRepository.findOne({
      where: { id },
      relations: { creator: true },
      // Del creador solo se expone name y userName (nunca email ni password)
      select: {
        id: true,
        name: true,
        description: true,
        likes: true,
        estimatedPrice: true,
        estimatedTime: true,
        recomendations: true,
        address: true,
        equipment: true,
        image: true,
        creator: { name: true, userName: true },
      },
    });
    if (!plan) {
      throw new NotFoundException(`Plan with id "${id}" not found`);
    }
    return plan;
  }

  async create(
    { userId, ...data }: CreatePlanDto,
    ip?: string,
  ): Promise<PlanDetail> {
    const creator = await this.usersRepository.findOneBy({ id: userId });
    if (!creator) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    const { ipv4, mac } = await resolveClientAddress(ip);

    // El plan y su registro de creación van juntos: o se guardan ambos o ninguno
    const plan = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(PlanEntity, { ...data, creator }),
      );
      await manager.save(
        manager.create(PlanCreationLogEntity, { plan: saved, ipv4, mac }),
      );
      return saved;
    });
    // Misma forma que el detalle (GET /plans/:id)
    return this.findOne(plan.id);
  }

  /** Registra una consulta de planes; si el usuario no está registrado se guarda sin usuario. */
  async logQuery(
    action: PlanQueryAction,
    ip: string | undefined,
    userId?: string,
    planId?: string,
  ): Promise<void> {
    const { ipv4, mac } = await resolveClientAddress(ip);
    const userExists =
      !!userId && (await this.usersRepository.existsBy({ id: userId }));
    await this.queryLogsRepository.save(
      this.queryLogsRepository.create({
        action,
        plan: planId ? { id: planId } : null,
        user: userExists ? { id: userId } : null,
        ipv4,
        mac,
      }),
    );
  }

  async like(planId: string, userId: string): Promise<PlanDetail> {
    // Registrar el like y subir el contador van juntos: o pasan ambos o ninguno
    await this.dataSource.transaction(async (manager) => {
      if (await this.hasLiked(manager, planId, userId)) {
        throw new ConflictException('User already liked this plan');
      }
      await manager
        .createQueryBuilder()
        .relation(UserEntity, 'myLikes')
        .of(userId)
        .add(planId);
      await manager.increment(PlanEntity, { id: planId }, 'likes', 1);
    });

    return this.findOne(planId);
  }

  async unlike(planId: string, userId: string): Promise<PlanDetail> {
    await this.dataSource.transaction(async (manager) => {
      if (!(await this.hasLiked(manager, planId, userId))) {
        throw new ConflictException('User has not liked this plan');
      }
      await manager
        .createQueryBuilder()
        .relation(UserEntity, 'myLikes')
        .of(userId)
        .remove(planId);
      await manager.decrement(PlanEntity, { id: planId }, 'likes', 1);
    });

    return this.findOne(planId);
  }

  /** Valida que el plan y el usuario existan y dice si el usuario ya dio like. */
  private async hasLiked(
    manager: EntityManager,
    planId: string,
    userId: string,
  ): Promise<boolean> {
    if (!(await manager.existsBy(PlanEntity, { id: planId }))) {
      throw new NotFoundException(`Plan with id "${planId}" not found`);
    }
    if (!(await manager.existsBy(UserEntity, { id: userId }))) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
    return manager
      .createQueryBuilder(UserEntity, 'user')
      .innerJoin('user.myLikes', 'plan', 'plan.id = :planId', { planId })
      .where('user.id = :userId', { userId })
      .getExists();
  }
}
