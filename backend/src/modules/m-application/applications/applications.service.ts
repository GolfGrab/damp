import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createApplicationDto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
        apiKey: crypto.getRandomValues(new Uint8Array(16)).join(''),
      },
    });
  }

  findAll() {
    return this.prisma.application.findMany();
  }

  findAllByCreatedByUserId(createdByUserId: string) {
    return this.prisma.application.findMany({
      where: {
        createdByUserId,
      },
    });
  }

  findOne(applicationId: number) {
    return this.prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
      },
    });
  }

  update(applicationId: number, updateApplicationDto: UpdateApplicationDto) {
    return this.prisma.application.update({
      where: {
        id: applicationId,
      },
      data: updateApplicationDto,
    });
  }

  remove(applicationId: number) {
    return this.prisma.application.delete({
      where: {
        id: applicationId,
      },
    });
  }
}
