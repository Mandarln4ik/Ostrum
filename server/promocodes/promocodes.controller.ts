import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PromocodesService } from './promocodes.service';

@Controller('api/promocodes')
export class PromocodesController {
  constructor(private service: PromocodesService) {}

  @Get() getAll() { return this.service.findAll(); }
  @Post() create(@Body() dto: any) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: any) { return this.service.update(+id, dto); }
  @Delete(':id') delete(@Param('id') id: string) { return this.service.delete(+id); }

  @Post('redeem')
  redeem(@Body() body: { userId: number, code: string }) {
    return this.service.redeem(body.userId, body.code);
  }
}