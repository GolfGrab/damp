import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import * as prisma from '@prisma/client';
import { AccountsService } from './accounts/accounts.service';
import { UpsertAccountDto } from './accounts/dto/upsert-account.dto';
import { Account } from './accounts/entities/account.entity';
import { CreateUserPreferenceDto } from './user-preferences/dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './user-preferences/dto/update-user-preference.dto';
import { UserPreference } from './user-preferences/entities/user-preference.entity';
import { UserPreferencesService } from './user-preferences/user-preferences.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { User } from './users/entities/user.entity';
import { UsersService } from './users/users.service';
import { VerifyUserDto } from './users/dto/verify-user.dto';

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

  @Patch('users/:userId')
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(userId, updateUserDto);
  }

  /**
   * Accounts
   **/

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Post('users/:userId/channel/:channelType/accounts')
  createAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() upsertAccountDto: UpsertAccountDto,
  ): Promise<Account> {
    return this.accountsService.upsert(userId, channelType, upsertAccountDto);
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Get('users/:userId/channel/:channelType/accounts')
  findOneAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
  ): Promise<Account> {
    return this.accountsService.findOne(userId, channelType);
  }

  @Get('accounts')
  findAllAccounts(): Promise<Account[]> {
    return this.accountsService.findAll();
  }

  @Get('users/:userId/accounts')
  findAllUserAccountsByUserId(
    @Param('userId') userId: string,
  ): Promise<Account[]> {
    return this.accountsService.findAllByUserId(userId);
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Patch('users/:userId/channel/:channelType/accounts')
  updateAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() upsertAccountDto: UpsertAccountDto,
  ): Promise<Account> {
    return this.accountsService.upsert(userId, channelType, upsertAccountDto);
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Delete('users/:userId/channel/:channelType/accounts')
  removeAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
  ) {
    return this.accountsService.remove(userId, channelType);
  }

  // async verify(
  //   userId: string,
  //   channelType: prisma.$Enums.ChannelType,
  //   otpCode: string,
  // ) {

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Post('users/:userId/channel/:channelType/accounts/verify')
  verifyAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() verifyUserDto: VerifyUserDto,
  ) {
    return this.accountsService.verify(userId, channelType, verifyUserDto);
  }

  /**
   * User Preferences
   **/

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Post(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  createUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() createUserPreferenceDto: CreateUserPreferenceDto,
  ): Promise<UserPreference> {
    return this.userPreferencesService.create(
      userId,
      notificationCategoryId,
      channelType,
      createUserPreferenceDto,
    );
  }

  @Get('user-preferences')
  findAllUserPreferences(): Promise<UserPreference[]> {
    return this.userPreferencesService.findAll();
  }

  @Get('users/:userId/user-preferences')
  findAllUserPreferencesByUserId(
    @Param('userId') userId: string,
  ): Promise<UserPreference[]> {
    return this.userPreferencesService.findAllByUserId(userId);
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Get(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  findOneUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: string,
  ): Promise<UserPreference> {
    return this.userPreferencesService.findOne(
      userId,
      notificationCategoryId,
      channelType,
    );
  }

  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Patch(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  updateUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ): Promise<UserPreference> {
    return this.userPreferencesService.update(
      userId,
      notificationCategoryId,
      channelType,
      updateUserPreferenceDto,
    );
  }
}
