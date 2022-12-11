import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { DataSource, Repository } from 'typeorm';
// import { COFFEE_BRANDS } from './coffees.constants';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

// @Injectable({scope: Scope.REQUEST})
@Injectable()
export class CoffeesService {
    // private coffees: Coffee[] = [
    //     {
    //         id: 1,
    //         name: 'Shipwreck Roast',
    //         brand: 'Buddy brew',
    //         flavors: ['chocolate', 'vanilla']
    //     }
    // ];

    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
        private readonly dataSource: DataSource,
        // @Inject(COFFEE_BRANDS) coffeeBrands: string[],
        private readonly configService: ConfigService
    ) {
        // const databaseHost = this.configService.get<string>('database.host', 'localhost');
        // console.log(databaseHost);
        
    }

    findAll(paginatorQuery: PaginationQueryDto) {
        const {limit, offset} = paginatorQuery;
        return this.coffeeRepository.find({
            relations: {
                flavors: true
            },
            skip: offset,
            take: limit
        });
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne({
            where: {id: +id},
            relations: {
                flavors: true
            }
        });
        if(!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createdCoffeeDto: CreateCoffeeDto) {
        const flavors = await Promise.all(
            createdCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
        );
        const coffee = this.coffeeRepository.create({
            ...createdCoffeeDto, flavors})
        return this.coffeeRepository.save(coffee);
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const flavors = 
        updateCoffeeDto.flavors &&
        (await Promise.all(
            updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
        ));
        const existingCoffee = await this.coffeeRepository.preload({
            id: +id,
            ...updateCoffeeDto,
            flavors
        });
        if(!existingCoffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }

        return this.coffeeRepository.save(existingCoffee);
    }

    async remove(id: string) {
        const coffee = await this.findOne(id);
        if(!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.remove(coffee);
    }

    async recommendedCoffee(coffee: Coffee) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            coffee.recommendations ++;

            const recommendedEvent = new Event();
            recommendedEvent.name = 'recommend_coffee';
            recommendedEvent.type = 'coffee';
            recommendedEvent.payload = {coffeeId: coffee.id};
            
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    private async preloadFlavorByName(name: string): Promise<Flavor> {
        const existingFlavor = await this.flavorRepository.findOne({ where: {name} });
        if(existingFlavor) {
            return existingFlavor;
        }

        return this.flavorRepository.create({name})
    }
}
