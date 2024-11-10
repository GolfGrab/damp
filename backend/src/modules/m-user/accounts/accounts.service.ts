import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'nestjs-prisma';
import * as prisma from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    createAccountDto: CreateAccountDto,
  ) {
    return this.prisma.account.create({
      data: {
        userId,
        channelType,
        ...createAccountDto,
      },
    });
  }

  findAll() {
    return this.prisma.account.findMany();
  }

  findAllByUserId(userId: string) {
    return this.prisma.account.findMany({
      where: {
        userId,
      },
    });
  }

  findOne(userId: string, channelType: prisma.$Enums.ChannelType) {
    return this.prisma.account.findUniqueOrThrow({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
    });
  }

  update(
    userId: string,
    channelType: prisma.$Enums.ChannelType,
    updateAccountDto: UpdateAccountDto,
  ) {
    return this.prisma.account.update({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
      data: {
        ...updateAccountDto,
      },
    });
  }

  remove(userId: string, channelType: prisma.$Enums.ChannelType) {
    return this.prisma.account.delete({
      where: {
        userId_channelType: {
          userId,
          channelType,
        },
      },
    });
  }
}
