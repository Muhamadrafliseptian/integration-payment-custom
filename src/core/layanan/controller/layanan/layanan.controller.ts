import { Controller, Get } from '@nestjs/common';
import { LayananService } from '../../services/layanan/layanan.service';

@Controller('layanan')
export class LayananController {
  constructor(private layananService: LayananService) {}

  @Get()
  async getLayanan() {
    return this.layananService.findLayanan();
  }
}
