import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm/entities/User';
import { CreateUserParams, UpdateUserParams } from 'src/utils/type';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { PageMetaDto } from 'src/core/dtos/pagination/page-meta.dto';

@Injectable({})
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // findUsers() {
  //   return this.userRepository.find();
  // }

  public async getUsers(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    queryBuilder
      .orderBy('users.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  createUser(userDetails: CreateUserParams) {
    const newUser = this.userRepository.create({
      ...userDetails,
      createdAt: new Date(),
    });
    return this.userRepository.save(newUser);
  }

  updateUser(id: number, updateUserDetails: UpdateUserParams) {
    this.userRepository.update({ id }, { ...updateUserDetails });
  }

  deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }
}
