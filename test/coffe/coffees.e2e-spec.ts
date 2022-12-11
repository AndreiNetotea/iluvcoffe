import { HttpServer, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import * as request from 'supertest';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto';
import { UpdateCoffeeDto } from '../../src/coffees/dto/update-coffee.dto';

describe('[Feature] Coffees - /coffees', () => {
    const coffee = {
        name: 'Shipwreck Roast',
        brand: 'Buddy Brew',
        flavors: ['chocolate', 'vanilla']
    };

    const expectedPartialCoffee = expect.objectContaining({
        ...coffee,
        flavors: expect.arrayContaining(
            coffee.flavors.map(name => expect.objectContaining({ name })),
        ),
    });

    let app: INestApplication;
    let httpServer: HttpServer;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                CoffeesModule,
                TypeOrmModule.forRootAsync({
                    useFactory: () => ({
                        type: 'postgres',
                        host: process.env.DATABASE_HOST,
                        port: +process.env.DATABASE_TEST_PORT,
                        username: 'admin',
                        password: 'pass123',
                        database: 'postgres',
                        autoLoadEntities: true,
                        // Disable in production
                        synchronize: true,
                    })
                  }),
            ],
          }).compile();
      
          app = moduleFixture.createNestApplication();

          app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
              enableImplicitConversion: true
            }
          }));
          await app.init();
          httpServer = app.getHttpServer();
    });


    it('Create [POST /]', () => {
        return request(httpServer)
          .post('/coffees')
          .send(coffee as CreateCoffeeDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            expect(body).toEqual(expectedPartialCoffee);
          });
      });
    
      it('Get all [GET /]', () => {
        return request(httpServer)
          .get('/coffees')
          .then(({ body }) => {
            expect(body.length).toBeGreaterThan(0);
            expect(body[0]).toEqual(expectedPartialCoffee);
          });
      });
    
      it('Get one [GET /:id]', () => {
        return request(httpServer)
          .get('/coffees/1')
          .then(({ body }) => {
            expect(body).toEqual(expectedPartialCoffee);
          });
      });
    
      it('Update one [PATCH /:id]', () => {
        const updateCoffeeDto: UpdateCoffeeDto = {
          ...coffee,
          name: 'New and Improved Shipwreck Roast'
        }
        return request(httpServer)
          .patch('/coffees/1')
          .send(updateCoffeeDto)
          .then(({ body }) => {
            expect(body.name).toEqual(updateCoffeeDto.name);
    
            return request(httpServer)
              .get('/coffees/1')
              .then(({ body }) => {
                expect(body.name).toEqual(updateCoffeeDto.name);
              });
          });
      });
    
      it('Delete one [DELETE /:id]', () => {
        return request(httpServer)
          .delete('/coffees/1')
          .expect(HttpStatus.OK)
          .then(() => {
            return request(httpServer)
              .get('/coffees/1')
              .expect(HttpStatus.NOT_FOUND);
          })
      });
    // it.todo('Delete one [DELETE /:id]');

    afterAll(async () => {
        await app.close();
    })
});