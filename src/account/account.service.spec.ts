import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import { getConnectionName } from 'nest-postgres';
import { dbResponse } from '../db/db.response.type';
import { AccountService } from './account.service';
import { AccountDto } from './dto/AccountDto';
import { BadRequestException } from '@nestjs/common';

let service: AccountService;

jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
    };
    return { Client: jest.fn(() => mClient) };
});

const mClient = {
    // connect: jest.fn(),
    // end: jest.fn(),
    query: jest.fn(),
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

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            AccountService,
            {
                provide: getConnectionName({ clientOptions: new Client() }),
                useValue: mClient,
            },
        ],
    }).compile();

    service = module.get<AccountService>(AccountService);
});
afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});

describe('AccountService', () => {
    describe('find', () => {
        describe('given a valid account ID', () => {
            it('should return an AccountDto', async () => {
                const expectData: AccountDto = {
                    account_id: '1',
                    username: 'korrawee',
                    password: '1234',
                    fullname: 'korrawee somyos',
                    role: 'manager',
                    telephone: '0987654321',
                    performance: null,
                    details: { address: '1/222 Pakkret Nonthaburi 11200' },
                    mng_id: null,
                };
                const testData = '1';
                const expectQuery = `SELECT * FROM accounts WHERE account_id='${testData}';`;

                // Mock database response
                const res = { ...dbRes };
                res['rows'] = [{ ...expectData }];
                mClient.query.mockResolvedValueOnce(Promise.resolve(res));

                // Call the method
                const result = await service.find(testData);

                expect(mClient.query).toBeCalledWith(
                    expect.stringContaining(expectQuery)
                );
                expect(result).toEqual(expectData);
            });
        });

        describe('given an invalid account id', () => {
            it('should throw BadRequestException', async () => {
                // Mock the database response
                const res = { ...dbRes };
                res['rows'] = [];
                mClient.query.mockResolvedValueOnce(Promise.resolve(res));

                const testData = 'bad-id';

                await expect(service.find(testData)).rejects.toThrow(
                    BadRequestException
                );
                await expect(service.find(testData)).rejects.toThrow(
                    'account id must be an integer'
                );
            });
        });
    });
    // ==========================================++
    // ==========================================++
    describe('findByIds', () => {
        describe('given valid array of account id', () => {
            it('should return an array of AccountDto', async () => {
                const testData = ['1', '2'];
                const expectData: AccountDto[] = [
                    {
                        account_id: '1',
                        username: 'user1',
                        password: '1234',
                        fullname: 'karn somyos',
                        role: 'worker',
                        telephone: '0987654321',
                        performance: null,
                        details: { address: '1/222 Pakkret Nonthaburi 11200' },
                        mng_id: 'null',
                    },
                    {
                        account_id: '2',
                        username: 'user2',
                        password: '1234',
                        fullname: 'ronnawee somyos',
                        role: 'worker',
                        telephone: '0987654321',
                        performance: null,
                        details: { address: '1/222 Pakkret Nonthaburi 11200' },
                        mng_id: 'null',
                    },
                ];
                const res = { ...dbRes };
                res['rows'] = [{ ...expectData }];

                mClient.query.mockResolvedValueOnce(Promise.resolve(res));

                const result = await service.findByIds(testData);

                const expectQuery = `SELECT * FROM accounts WHERE account_id IN ( '${testData[0]}', '${testData[1]}') ORDER BY cast(account_id AS int);`;
                expect(mClient.query).toHaveBeenCalledWith(
                    expect.stringContaining(expectQuery)
                );
                expect(result).toEqual([
                    {
                        '0': { ...expectData[0] },
                        '1': { ...expectData[1] },
                    },
                ]);
            });
        });
        describe('should throw BadRequestException', () => {
            it('should throw BadRequestException', async () => {
                // Mock the database response
                const testData = ['bad-id', '2'];

                await expect(service.findByIds(testData)).rejects.toThrow(
                    BadRequestException
                );
                await expect(service.findByIds(testData)).rejects.toThrow(
                    'account id must be an integer'
                );
            });
        });
    });
    // ==========================================++
    // ==========================================++

    it('should be find all accounts', async () => {
        const data = {
            account_id: '1',
            username: 'user',
            password: 'pwd',
            fullname: 'name name',
            role: 'worker',
            telephone: '0987654321',
            performance: 100,
            details: { address: '1/222' },
            mng_id: '2',
        };
        const res = { ...dbRes };
        res['rows'] = [{ ...data }];

        mClient.query.mockResolvedValueOnce(Promise.resolve(res));

        expect(await service.findAll()).toEqual([data]);
    });

    describe('updateUserName', () => {
        describe('given a valid account id and a valid newUsername', () => {
            it('should return data of the account ', async () => {
                const data = {
                    account_id: '1',
                    username: 'korrawee',
                    password: 'passWord',
                    fullname: 'korrawee somyos',
                    role: 'worker',
                    telephone: '0987654321',
                    performance: 100,
                    details: { address: '1/222' },
                    mng_id: '2',
                };
                const testData = { id: '1', newUsername: 'somyos' };
                const res = { ...dbRes };
                res['rows'] = [{ ...data, username: testData.newUsername }];

                mClient.query.mockResolvedValueOnce(Promise.resolve(res));
                const result = await service.updateUsername(
                    testData.id,
                    testData.newUsername
                );
                expect(result).toEqual([
                    {
                        ...data,
                        username: testData.newUsername,
                    },
                ]);
            });
        });

        describe('given an invalid account id and a valid newUsername', () => {
            it('should throw BadRequestException with message "account id must be an integer"', async () => {
                // Mock the database response
                const testData = { id: '1', newUsername: 'somyos' };

                jest.spyOn(mClient, 'query').mockRejectedValueOnce(
                    new BadRequestException(expect.any(String))
                );

                await expect(
                    service.updateUsername(testData.id, testData.newUsername)
                ).rejects.toThrow(BadRequestException);
            });
        });
    });
});
