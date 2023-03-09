import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PostgresModule } from 'nest-postgres';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { RequestDto } from '../src/relations/request/dto/Request.dto';
import { CreateOtRequestDto } from '../src/relations/request/dto/CreateOtRequest.dto';

const moment = require('moment');
const fs = require('fs');

let app: INestApplication;
let configService: ConfigService;
let client: Client;

const cleanUp = fs.readFileSync('sql/schema.sql', 'utf-8');
const insertData = fs.readFileSync('sql/dev-seeds.sql', 'utf-8');

const RequestPayload: CreateOtRequestDto = {
    shiftCode: '1',
    date: moment().format('YYYY-MM-DD'),
    method: '',
    mngId: '0',
    unit: 'hour',
    quantity: 4,
    accountIds: ['1'],
};
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
describe('OtRequestController (e2e)', () => {
    describe('get data for ot-request page API', () => {
        const baseURL = '/ot-request/accounts';

        describe('given a valid account id', () => {
            it("should get status code 200 with data in response's body", async () => {
                const accId = '1';
                const uri = `${baseURL}/${accId}`;
                const { status, body } = await request(app.getHttpServer()).get(
                    uri
                );

                expect(status).toBe(200);
                expect(body).toBeInstanceOf(Array<RequestDto>);
            });
        });

        describe('gievn an invalid account id', () => {
            it('should have status code 400', async () => {
                const accId = 'bad-id';
                const uri = `${baseURL}/${accId}`;

                const { status } = await request(app.getHttpServer()).get(uri);

                expect(status).toBe(400);
            });
        });
    });
});
