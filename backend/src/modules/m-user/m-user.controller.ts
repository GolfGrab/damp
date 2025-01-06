import { Auth, GetUser } from '@/auth/auth.decorator';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import * as prisma from '@prisma/client';
import { AccountsService } from './accounts/accounts.service';
import { UpsertAccountDto } from './accounts/dto/upsert-account.dto';
import { Account } from './accounts/entities/account.entity';
import { UpsertUserPreferenceDto } from './user-preferences/dto/upsert-user-preference.dto';
import { UserPreference } from './user-preferences/entities/user-preference.entity';
import { UserPreferencesService } from './user-preferences/user-preferences.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { VerifyUserDto } from './users/dto/verify-user.dto';
import { User } from './users/entities/user.entity';
import { UsersService } from './users/users.service';

@ApiTags('User Module')
@Controller('m-user')
export class MUserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountsService: AccountsService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  /**
   * Users
   **/

  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get('users/:userId')
  findOneUser(@Param('userId') userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  @Get('users')
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Accounts
   **/

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Auth()
  @Put('users/:userId/channel/:channelType/accounts')
  upsertAccount(
    @GetUser() user: User,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() upsertAccountDto: UpsertAccountDto,
  ): Promise<Account> {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.accountsService.upsert(userId, channelType, upsertAccountDto);
  }

  @Auth()
  @Get('users/:userId/accounts')
  findAllUserAccountsByUserId(
    @GetUser() user: User,
    @Param('userId') userId: string,
  ): Promise<Account[]> {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.accountsService.findAllByUserId(userId);
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Auth()
  @Delete('users/:userId/channel/:channelType/accounts')
  removeAccount(
    @GetUser() user: User,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.accountsService.remove(userId, channelType);
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Auth()
  @Post('users/:userId/channel/:channelType/accounts/verify')
  verifyAccount(
    @GetUser() user: User,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() verifyUserDto: VerifyUserDto,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.accountsService.verify(userId, channelType, verifyUserDto);
  }

  /**
   * User Preferences
   **/

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Auth()
  @Put(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  upsertUserPreference(
    @GetUser() user: User,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() createUserPreferenceDto: UpsertUserPreferenceDto,
  ): Promise<UserPreference> {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.userPreferencesService.upsert(
      userId,
      notificationCategoryId,
      channelType,
      createUserPreferenceDto,
    );
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Auth()
  @Put('users/:userId/channel/:channelType/user-preferences')
  updateManyUserPreferences(
    @GetUser() user: User,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() upsertUserPreferenceDto: UpsertUserPreferenceDto,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.userPreferencesService.updateManyByUserIdAndChannelType(
      userId,
      channelType,
      upsertUserPreferenceDto,
    );
  }

  @Auth()
  @Get('users/:userId/user-preferences')
  findAllUserPreferencesByUserId(
    @GetUser() user: User,
    @Param('userId') userId: string,
  ): Promise<UserPreference[]> {
    if (user.id !== userId) {
      throw new ForbiddenException();
    }
    return this.userPreferencesService.findAllByUserId(userId);
  }
}
