import { Role, Roles } from '@/auth/auth-roles.decorator';
import { Auth, GetUser } from '@/auth/auth.decorator';
import { UserWithRoles } from '@/auth/UserWithRoles';
import { ApiPaginatedResponse } from '@/utils/paginator/pagination.decorator';
import { PaginatedResult } from '@/utils/paginator/pagination.type';
import { PaginationQueryDto } from '@/utils/paginator/paginationQuery.dto';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import * as prisma from '@prisma/client';
import { AccountsService } from './accounts/accounts.service';
import { UpsertAccountDto } from './accounts/dto/upsert-account.dto';
import { Account } from './accounts/entities/account.entity';
import { UpsertUserPreferenceDto } from './user-preferences/dto/upsert-user-preference.dto';
import { UserPreference } from './user-preferences/entities/user-preference.entity';
import { UserPreferencesService } from './user-preferences/user-preferences.service';
import { CreateManyUsersDto } from './users/dto/create-many-users.dto';
import { UsersOrderDto } from './users/dto/users-order.dto';
import { UsersSearchDto } from './users/dto/users-search.dto';
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

  @Auth()
  @Roles(Role.Admin)
  @Patch('users')
  upsertManyUsers(
    @Body() createManyUsersDto: CreateManyUsersDto,
    @GetUser() user: UserWithRoles,
  ) {
    return this.usersService.upsertMany(createManyUsersDto, user);
  }

  @Auth()
  @Roles(Role.Admin)
  @Get('users')
  @ApiPaginatedResponse(User)
  findAllUsers(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query() usersOrderDto: UsersOrderDto,
    @Query() usersSearchDto: UsersSearchDto,
  ): Promise<PaginatedResult<User>> {
    return this.usersService.findAll(
      paginationQueryDto,
      usersOrderDto,
      usersSearchDto,
    );
  }

  /**
   * Accounts
   **/

  @Auth()
  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Put('users/:userId/channel/:channelType/accounts')
  upsertAccount(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() upsertAccountDto: UpsertAccountDto,
  ): Promise<Account> {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't update other user's account");
    }
    return this.accountsService.upsert(userId, channelType, upsertAccountDto);
  }

  @Auth()
  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Post('users/:userId/channel/:channelType/accounts/otp')
  createNewOtp(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException(
        "You can't create OTP for other user's account",
      );
    }
    return this.accountsService.createNewOtp(userId, channelType);
  }

  @Auth()
  @Get('users/:userId/accounts')
  findAllUserAccountsByUserId(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
  ): Promise<Account[]> {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't access other user's accounts");
    }
    return this.accountsService.findAllByUserId(userId);
  }

  @Auth()
  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Delete('users/:userId/channel/:channelType/accounts')
  removeAccount(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't remove other user's account");
    }
    return this.accountsService.remove(userId, channelType);
  }

  @Auth()
  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Post('users/:userId/channel/:channelType/accounts/verify')
  verifyAccount(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() verifyUserDto: VerifyUserDto,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't verify other user's account");
    }
    return this.accountsService.verify(userId, channelType, verifyUserDto);
  }

  /**
   * User Preferences
   **/

  @Auth()
  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Put(
    'users/:userId/channel/:channelType/notification-categories/:notificationCategoryId/user-preferences',
  )
  upsertUserPreference(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Param('notificationCategoryId') notificationCategoryId: string,
    @Body() createUserPreferenceDto: UpsertUserPreferenceDto,
  ): Promise<UserPreference> {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't update other user's preferences");
    }
    return this.userPreferencesService.upsert(
      userId,
      notificationCategoryId,
      channelType,
      createUserPreferenceDto,
    );
  }

  @Auth()
  @ApiParam({
    name: 'channelType',
    enum: prisma.$Enums.ChannelType,
  })
  @Put('users/:userId/channel/:channelType/user-preferences')
  updateManyUserPreferences(
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
    @Param('channelType') channelType: prisma.$Enums.ChannelType,
    @Body() upsertUserPreferenceDto: UpsertUserPreferenceDto,
  ) {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't update other user's preferences");
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
    @GetUser() user: UserWithRoles,
    @Param('userId') userId: string,
  ): Promise<UserPreference[]> {
    if (user.id !== userId) {
      throw new ForbiddenException("You can't access other user's preferences");
    }
    return this.userPreferencesService.findAllByUserId(userId);
  }
}
