import { Role } from '@/auth/auth-roles.decorator';
import { UserWithRoles } from '@/auth/UserWithRoles';
import { Config } from '@/utils/config/config-dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { kebabCase } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationWithApiKey } from './entities/application-with-api-key.entity';
import { Application } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  selectAllFieldsIncludingApiKey = Object.fromEntries(
    Object.values(Prisma.ApplicationScalarFieldEnum).map((field) => [
      field,
      true,
    ]),
  ) as Prisma.ApplicationSelect;

  create(
    createApplicationDto: CreateApplicationDto,
    user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    const id =
      kebabCase(createApplicationDto.name) + '-' + new Date().getTime();

    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
        id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
        apiKey: crypto.randomUUID(),
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }

  findAll(user: UserWithRoles): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: {
        id: {
          not: this.config.SYSTEM_APPLICATION_ID,
        },
        createdByUserId: user.roles.includes(Role.Admin) ? undefined : user.id,
      },
    });
  }

  findOne(
    applicationId: string,
    user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    return this.prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
        AND: [
          {
            createdByUserId: {
              not: this.config.SYSTEM_USER_ID,
            },
          },
          ...(user.roles.includes(Role.Admin)
            ? []
            : [{ createdByUserId: user.id }]),
        ],
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }

  update(
    applicationId: string,
    updateApplicationDto: UpdateApplicationDto,
    user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    return this.prisma.application.update({
      where: {
        id: applicationId,
        AND: [
          {
            createdByUserId: {
              not: this.config.SYSTEM_USER_ID,
            },
          },
          ...(user.roles.includes(Role.Admin)
            ? []
            : [{ createdByUserId: user.id }]),
        ],
      },
      data: {
        ...updateApplicationDto,
        updatedByUserId: user.id,
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }

  rotateApiKey(
    applicationId: string,
    user: UserWithRoles,
  ): Promise<ApplicationWithApiKey> {
    return this.prisma.application.update({
      where: {
        id: applicationId,
        AND: [
          {
            createdByUserId: {
              not: this.config.SYSTEM_USER_ID,
            },
          },
          ...(user.roles.includes(Role.Admin)
            ? []
            : [{ createdByUserId: user.id }]),
        ],
      },
      data: {
        apiKey: crypto.randomUUID(),
        updatedByUserId: user.id,
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }
}
