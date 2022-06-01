import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
    private coffees: Coffee[] = [
        {
            id: 1,
            name: 'Shipwreck Roast',
            brand: 'Buddy brew',
            flavors: ['chocolate', 'vanilla']
        }
    ];

    findAll() {
        return this.coffees;
    }

    findOne(id: string) {
        const coffee = this.coffees.find(item => item.id === +id);
        if(!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    create(createdCoffeeDto: any) {
        this.coffees.push(createdCoffeeDto);
        return createdCoffeeDto;
    }

    update(id: string, updateCoffeeDto: any) {
        const existingCoffee = this.findOne(id);
        if(existingCoffee) {
            // update existing coffee
        }
    }

    remove(id: string) {
        const coffeeIndex = this.coffees.findIndex(item => item.id === +id);
        if(coffeeIndex >= 0) {
            this.coffees.splice(coffeeIndex, 1)
        }
    }
}
