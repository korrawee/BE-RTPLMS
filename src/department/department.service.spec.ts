import { Test, TestingModule } from '@nestjs/testing';
import { PG_CONNECTION } from '../constants';
import { DepartmentService } from './department.service';
import { DepartmentforDashboardDto } from './dto/DepartmentforDashboard.dto';

describe('DepartmentService', () => {
  let service: DepartmentService;

  const mockRepository = {
    getDepartmentsById: jest.fn().mockImplementation((dto: DepartmentforDashboardDto) => {
      return Promise.resolve(
        [
          {
            department_id: '1',
            name: 'ต้มไก่',
          }
        ]
      )
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentService, {
        provide: PG_CONNECTION,
        useValue: mockRepository,
      }],
    }).compile();

    service = module.get<DepartmentService>(PG_CONNECTION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a department by manager\'s id', async () => {
    const data: DepartmentforDashboardDto[] = [
      {
        department_id: '1',
        name: 'ต้มไก่',
      }
    ]
    expect(await service.getDepartmentsById('1')).toEqual(data);
  });
});
