import { Test, TestingModule } from '@nestjs/testing';
import { DetailController } from './detail.controller';
import { DetailService } from './detail.service';
import { PersonDetailDto } from './dto/PersonDetail.dto';

describe('DetailController', () => {
    let controller: DetailController;
    let service: DetailService;

    const mockDetailService = {
        getData: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DetailController],
            providers: [DetailService],
        })
            .overrideProvider(DetailService)
            .useValue(mockDetailService)
            .compile();

        controller = module.get<DetailController>(DetailController);
        service = module.get<DetailService>(DetailService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get data for detail page', async () => {
        const expectResult: PersonDetailDto[] = [
            {
                name: 'full-name2',
                checkInTime: '07:00:00',
                checkOutTime: '-',
                checkInStatus: 'ปกติ',
            },
            {
                name: 'full-name3',
                checkInTime: '08:00:00',
                checkOutTime: '-',
                checkInStatus: 'ปกติ',
                otStatus: 'รอดำเนินการ',
                otDuration: 4,
            },
            {
                name: 'full-name4',
                checkInTime: '08:01:00',
                checkOutTime: '-',
                checkInStatus: 'สาย',
            },
            {
                name: 'full-name5',
                checkInTime: '-',
                checkOutTime: '-',
                checkInStatus: 'ยังไม่เข้างาน',
                otStatus: 'รอดำเนินการ',
                otDuration: 4,
            },
        ];
        jest.spyOn(service, 'getData').mockResolvedValueOnce(expectResult);

        const result = await controller.getData('1');
        expect(result).toEqual(expectResult);
        expect(service.getData).toHaveBeenCalledWith('1');
    });
});
