import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, SetMetadata } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { Protocol } from '../common/decorators/protocol.decorator';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {

    constructor(private readonly coffeesService: CoffeesService) {
        console.log('CoffeesController created');
    }

    // @SetMetadata('isPublic', true)
    @ApiForbiddenResponse({description: 'Forbidden'})
    @Public()
    @Get()
    findAll(@Protocol() protocol: string, @Query() paginatorQuery: PaginationQueryDto) {
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // const {limit, offset} = paginatorQuery;
        console.log(protocol);
        return this.coffeesService.findAll(paginatorQuery);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id:string) {
        console.log(id);
        return this.coffeesService.findOne(id);
    }

    @Public()
    @Post()
    create(@Body() createCoffeeDto: CreateCoffeeDto) {
        return this.coffeesService.create(createCoffeeDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
        return this.coffeesService.update(id, updateCoffeeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coffeesService.remove(id);
    }
}
