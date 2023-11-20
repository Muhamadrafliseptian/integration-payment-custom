import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { CreateUser } from 'src/users/dtos/CreateUser.dto';
import { UpdateUser } from 'src/users/dtos/UpdateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    return this.usersService.findUsers();
  }

  @Post()
  createUser(@Body() createUserDto: CreateUser) {
    this.usersService.createUser(createUserDto);
    return { msg: 'berhasil registrasi' };
  }

  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUser,
  ) {
    await this.usersService.updateUser(id, updateUserDto);
    return { msg: 'berhasil ubah data' };
  }
  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUser(id);
    return { msg: 'berhasil hapus data' };
  }
}
