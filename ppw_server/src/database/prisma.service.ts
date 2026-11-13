import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    if (process.env.USE_PRISMA === 'true') {
      await this.$connect();
      this.logger.log('Conectado ao PostgreSQL via Prisma Client.');
    }
  }

  async onModuleDestroy() {
    if (process.env.USE_PRISMA === 'true') {
      await this.$disconnect();
    }
  }
}
