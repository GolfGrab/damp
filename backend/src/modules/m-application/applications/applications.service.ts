import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { kebabCase } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationWithApiKey } from './entities/application-with-api-key';
import { Application } from './entities/application.entity';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  selectAllFieldsIncludingApiKey = Object.fromEntries(
    Object.values(Prisma.ApplicationScalarFieldEnum).map((field) => [
      field,
      true,
    ]),
  ) as Prisma.ApplicationSelect;

  create(
    createApplicationDto: CreateApplicationDto,
    user: User,
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

  findAll(): Promise<Application[]> {
    return this.prisma.application.findMany();
  }

  findAllByCreatedByUserId(createdByUserId: string): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: {
        createdByUserId,
      },
    });
  }

  findOne(applicationId: string): Promise<ApplicationWithApiKey> {
    return this.prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }

  update(
    applicationId: string,
    updateApplicationDto: UpdateApplicationDto,
    user: User,
  ): Promise<ApplicationWithApiKey> {
    return this.prisma.application.update({
      where: {
        id: applicationId,
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
    user: User,
  ): Promise<ApplicationWithApiKey> {
    return this.prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        apiKey: crypto.randomUUID(),
        updatedByUserId: user.id,
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }
}
