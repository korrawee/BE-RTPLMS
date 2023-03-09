import { Test, TestingModule } from '@nestjs/testing';
import { LogSrceenService } from './log.service';

describe('LogSrceenService', () => {
    let service: LogSrceenService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LogSrceenService],
        }).compile();

        service = module.get<LogSrceenService>(LogSrceenService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
