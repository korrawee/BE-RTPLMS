import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PostgresModule } from 'nest-postgres';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'pg';

import { DepartmentforDashboardDto } from '../../src/department/dto/DepartmentforDashboard.dto';
import { ShiftforDashboardDto } from '../../src/shift/dto/ShiftForDashboard.dto';

const fs = require('fs');
let app: INestApplication;
let configService: ConfigService;
let client: Client;

const cleanUp = fs.readFileSync('sql/schema.sql', 'utf-8');
const insertData = fs.readFileSync('sql/dev-seeds.sql', 'utf-8');

const moment = require('moment');

//====================+
// Setup Test Flows
//====================+
beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.test.env`,
            }),
            PostgresModule.forRootAsync({
                imports: [ConfigModule],

                useFactory: async (configService: ConfigService) => {
                    return {
                        connectionString: configService.get<string>(
                            'DB_CONNECTION_STRING'
                        ),
                    };
                },
                inject: [ConfigService],
            }),
            AppModule,
        ],
    }).compile();
    app = moduleFixture.createNestApplication();

    await app.init();
    configService = app.get<ConfigService>(ConfigService);

    // Setup test database
    client = new Client({
        connectionString: configService.get<string>('DB_CONNECTION_STRING'),
    });
    await client.connect();
    await client.query(cleanUp);
});

beforeEach(async () => {
    await client.query(insertData);
});

afterEach(async () => {
    await client.query(cleanUp);
});

afterAll(async () => {
    await app.close();
    await client.end();
});

//====================+
// Test Cases
//====================+
describe('DashboardController (e2e)', () => {
    const mngId = '0';
    const date = moment().format('YYYY-MM-DD');

    describe('given a valid manager id and date format', () => {
        it("should get status code 200 and have data in response's body", async () => {
            const uri = `/dashboard/${mngId}/${date}`;

            const { status, body } = await request(app.getHttpServer()).get(
                uri
            );
            expect(status).toBe(200);

            expect(body).toEqual({
                department: expect.any(Array<DepartmentforDashboardDto>),
                shifts: expect.any(Array<ShiftforDashboardDto>),
            });
        });
    });

    describe('given an invalid manager id and invalid date', () => {
        describe('given invalid manager id', () => {
            it('should have status code 400', async () => {
                const uri = `/dashboard/badId/0`;
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );
                console.log(body);
                expect(status).toBe(400);
            });
        });
        describe('given invalid date', () => {
            it('should have status code 400', async () => {
                const uri = `/dashboard/0/badDate`;
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );
                console.log(body);
                expect(status).toBe(400);
            });
        });
        describe('given an invalid manager id and invalid date', () => {
            it('should have status code 400', async () => {
                const uri = `/dashboard/badId/badDate`;
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );
                console.log(body);
                expect(status).toBe(400);
            });
        });
    });
});
