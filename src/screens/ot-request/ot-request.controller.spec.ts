import { Test, TestingModule } from '@nestjs/testing';
import { OtRequestController } from './ot-request.controller';

describe('OtRequestController', () => {
    let controller: OtRequestController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OtRequestController],
        }).compile();

        controller = module.get<OtRequestController>(OtRequestController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
