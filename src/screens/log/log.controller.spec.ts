import { Test, TestingModule } from '@nestjs/testing';
import { LogScreenController } from './log.controller';

describe('LogScreenController', () => {
    let controller: LogScreenController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LogScreenController],
        }).compile();

        controller = module.get<LogScreenController>(LogScreenController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
