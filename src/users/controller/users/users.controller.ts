import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  ParseIntPipe,
  Param,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { RolesDto } from 'src/core/dtos/roles/roles.dto';
import { User } from 'src/typeorm/entities/User';
import { CreateUser } from 'src/users/dtos/CreateUser.dto';
import { UpdateUser } from 'src/users/dtos/UpdateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    return this.usersService.getUsers(pageOptionsDto);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUser) {
    this.usersService.createUser(createUserDto);
    return { msg: 'berhasil registrasi' };
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    this.usersService.getUsersById(id);
  }

  @Put(':id')
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUser,
  ) {
    this.usersService.updateUser(id, updateUserDto);
    return { msg: 'berhasil ubah data' };
  }
  @Delete(':id')
  deleteUserById(@Param('id', ParseIntPipe) id: number) {
    this.usersService.deleteUser(id);
    return { msg: 'berhasil hapus data' };
  }

  @Post(':id/roles')
  createUserProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() createUserProfileDto: RolesDto,
  ) {
    return this.usersService.createRoles(id, createUserProfileDto);
  }
}
