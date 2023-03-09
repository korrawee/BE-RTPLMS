import { Test, TestingModule } from '@nestjs/testing';
import { OtRequestService } from './ot-request.service';

describe('OtRequestService', () => {
    let service: OtRequestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OtRequestService],
        }).compile();

        service = module.get<OtRequestService>(OtRequestService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
