import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PostgresModule } from 'nest-postgres';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { LogDto } from 'src/log/dto/Log.dto';

const moment = require('moment');
const fs = require('fs');

let app: INestApplication;
let configService: ConfigService;
let client: Client;

const cleanUp = fs.readFileSync('sql/schema.sql', 'utf-8');
const inertData = fs.readFileSync('sql/dev-seeds.sql', 'utf-8');

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
    await client.query(inertData);
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
describe('LogController (e2e)', () => {
    describe('get data for log page API', () => {
        const baseURL = '/log-screen/managers';

        describe('given a valid manager id and date', () => {
            it("should get status code 200 with data in response's body", async () => {
                const mngId = '0';
                const date = moment().format('YYYY-MM-DD');
                const uri = `${baseURL}/${mngId}/${date}`;
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );

                expect(status).toBe(200);
                expect(body).toBeInstanceOf(Array<LogDto>);
            });
        });

        describe('gievn an invalid manager id and date', () => {
            it('should have status code 400', async () => {
                const mngId = 'bad-id';
                const date = 'bad-date';
                const uri = `${baseURL}/${mngId}/${date}`;

                const { status } = await request(app.getHttpServer()).get(uri);

                expect(status).toBe(400);
            });
        });
    });
});
