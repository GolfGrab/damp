import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  ): Promise<ApplicationWithApiKey> {
    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
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

  findOne(applicationId: string): Promise<Application> {
    return this.prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
      },
    });
  }

  update(
    applicationId: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    return this.prisma.application.update({
      where: {
        id: applicationId,
      },
      data: updateApplicationDto,
    });
  }

  rotateApiKey(applicationId: string): Promise<ApplicationWithApiKey> {
    return this.prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        apiKey: crypto.randomUUID(),
      },
      select: this.selectAllFieldsIncludingApiKey,
    });
  }
}
