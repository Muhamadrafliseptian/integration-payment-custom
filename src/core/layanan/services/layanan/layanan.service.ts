import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Layanan } from 'src/typeorm/entities/Layanan';
import { Repository } from 'typeorm';

@Injectable({})
export class LayananService {
  constructor(
    @InjectRepository(Layanan) private layananRepository: Repository<Layanan>,
  ) {}

  findLayanan() {
    return this.layananRepository.find();
  }
}
