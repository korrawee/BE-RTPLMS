import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
describe('AppController', () => {
  let appController: AppController;
  const mockAppService = {
    
  }
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).overrideProvider(AppService).useValue(mockAppService).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined.', () => {
      expect(appController).toBeDefined();
    });
  });
});
