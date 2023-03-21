import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PostgresModule } from 'nest-postgres';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { WorkPlanSchedule } from '../../src/screens/schedule/dto/WorkPlanSchedule.dto';
import { OtPlanSchedule } from '../../src/screens/schedule/dto/OtPlanSchedule.dto';

const moment = require('moment');
const fs = require('fs');

let app: INestApplication;
let configService: ConfigService;
let client: Client;

const cleanUp = fs.readFileSync('sql/schema.sql', 'utf-8');
const insertData = fs.readFileSync('sql/dev-seeds.sql', 'utf-8');

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
describe('ScheduleController (e2e)', () => {
    describe('get schedule data for work schedule page API', () => {
        const baseURL = (accId: string) =>
            `/schedule/accounts/${accId}/work-schedule`;

        describe('given a valid account id', () => {
            it("should get status code 200 with data in response's body", async () => {
                const accId = '1';
                const uri = baseURL(accId);
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );
                expect(status).toBe(200);
                expect(body).toBeInstanceOf(Array<WorkPlanSchedule>);
            });
        });

        describe('gievn an invalid account id', () => {
            it('should have status code 400', async () => {
                const accId = 'bad-id';
                const uri = baseURL(accId);

                const { status } = await request(app.getHttpServer()).get(uri);
                expect(status).toBe(400);
            });
        });
    });

    describe('get ot data for work schedule page API', () => {
        const baseURL = (accId: string) =>
            `/schedule/accounts/${accId}/ot-schedule`;

        describe('given a valid account id', () => {
            it("should get status code 200 with data in response's body", async () => {
                const accId = '1';
                const uri = baseURL(accId);
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );
                expect(status).toBe(200);
                expect(body).toBeInstanceOf(Array<OtPlanSchedule>);
            });
        });
        describe('given an invalid account id', () => {
            it('should have status code 400', async () => {
                const accId = 'bad-id';
                const uri = baseURL(accId);

                const { status } = await request(app.getHttpServer()).get(uri);

                expect(status).toBe(400);
            });
        });
    });
});
