import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users/users.service';
import { AccountsService } from './accounts/accounts.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { CreateAccountDto } from './accounts/dto/create-account.dto';
import * as prisma from '@prisma/client';
import { UpdateAccountDto } from './accounts/dto/update-account.dto';
import { CreateUserPreferenceDto } from './user-preferences/dto/create-user-preference.dto';
import { UserPreferencesService } from './user-preferences/user-preferences.service';
import { UpdateUserPreferenceDto } from './user-preferences/dto/update-user-preference.dto';
import { User } from './users/entities/user.entity';
import { Account } from './accounts/entities/account.entity';
import { UserPreference } from './user-preferences/entities/user-preference.entity';

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

  @Delete('users/:userId')
  removeUser(@Param('userId') userId: string) {
    return this.usersService.remove(userId);
  }

  /**
   * Accounts
   **/

  @Post('users/:userId/channel/:channelType/accounts')
  createAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsService.create(userId, channelType, createAccountDto);
  }

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

  @Patch('users/:userId/channel/:channelType/accounts')
  updateAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(userId, channelType, updateAccountDto);
  }

  @Delete('users/:userId/channel/:channelType/accounts')
  removeAccount(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
  ) {
    return this.accountsService.remove(userId, channelType);
  }

  /**
   * User Preferences
   **/

  @Post(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  createUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: number,
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

  @Get(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  findOneUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: number,
  ): Promise<UserPreference> {
    return this.userPreferencesService.findOne(
      userId,
      notificationCategoryId,
      channelType,
    );
  }

  @Patch(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  updateUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: number,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ): Promise<UserPreference> {
    return this.userPreferencesService.update(
      userId,
      notificationCategoryId,
      channelType,
      updateUserPreferenceDto,
    );
  }

  @Delete(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  removeUserPreference(
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: number,
  ) {
    return this.userPreferencesService.remove(
      userId,
      notificationCategoryId,
      channelType,
    );
  }
}
