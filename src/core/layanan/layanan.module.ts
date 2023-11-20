import { Module } from '@nestjs/common';
import { LayananController } from './controller/layanan/layanan.controller';
import { LayananService } from './services/layanan/layanan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Layanan } from 'src/typeorm/entities/Layanan';
@Module({
  imports: [TypeOrmModule.forFeature([Layanan])],
  controllers: [LayananController],
  providers: [LayananService],
})
export class LayananModule {}
