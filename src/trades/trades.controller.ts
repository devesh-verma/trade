import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MethodNotAllowedException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { CreateTradeDto } from './dto/create-trade.dto';
import { FilterTradeDto } from './dto/filter-trade.dto';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  async create(
    @User('id') user_id: number,
    @Body() createTradeDto: CreateTradeDto,
  ) {
    return this.tradesService.create({
      ...createTradeDto,
      user_id,
    });
  }

  @Get()
  async findAll(@Query() filterDto: FilterTradeDto) {
    return this.tradesService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const trade = await this.tradesService.findOne(+id);
    if (!trade) {
      throw new NotFoundException('Trade not found');
    }
    return trade;
  }

  @Put(':id')
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  async put() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  async update() {
    throw new MethodNotAllowedException('Method not allowed');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  async remove() {
    throw new MethodNotAllowedException('Method not allowed');
  }
}
