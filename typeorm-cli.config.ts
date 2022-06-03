import { Coffee } from "src/coffees/entities/coffee.entity";
import { Flavor } from "src/coffees/entities/flavor.entity";
import { CoffeeRefactor1654236751844 } from "src/migrations/1654236751844-CoffeeRefactor";
import { SchemaSync1654238952243 } from "src/migrations/1654238952243-SchemaSync";
import { DataSource } from "typeorm";

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: 'pass123',
    database: 'postgres',
    entities: [Coffee, Flavor],
    migrations: [CoffeeRefactor1654236751844, SchemaSync1654238952243]
});
