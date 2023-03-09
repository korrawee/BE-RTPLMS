import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from 'src/db/db.response.type';
import { LogService } from './log.service';
import { Client } from 'pg';

describe('LogService', () => {
    jest.mock('pg', () => {
        const mClient = {
            connect: jest.fn(),
            query: jest.fn(),
            end: jest.fn(),
        };
        return { Client: jest.fn(() => mClient) };
    });
    
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    
    const dbRes: dbResponse = {
        command: '',
        rowCount: 1,
        oid: null,
        rows: [],
        _types: {},
        RowCtor: null,
        rowAsArray: true,
    };
    
    let service: LogService;
    let client: Client;
    beforeEach(async () => {
        client = new Client();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LogService,
                {
                    provide: getConnectionName({ clientOptions: client }),
                    useValue: mClient,
                },
            ],
        }).compile();
    
        service = module.get<LogService>(LogService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
