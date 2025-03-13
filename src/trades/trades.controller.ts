import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { FilterTradeDto } from './dto/filter-trade.dto';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  async create(@Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
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
    throw new HttpException(
      'Method not allowed',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  async update() {
    throw new HttpException(
      'Method not allowed',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  async remove() {
    throw new HttpException(
      'Method not allowed',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }
}
