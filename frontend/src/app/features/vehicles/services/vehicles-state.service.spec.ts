import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { VehiclesApiService } from './vehicles-api.service';
import { VehiclesStateService } from './vehicles-state.service';

describe('VehiclesStateService', () => {
  it('should update vehicles from API', (done) => {
    TestBed.configureTestingModule({
      providers: [
        VehiclesStateService,
        {
          provide: VehiclesApiService,
          useValue: {
            list: () => of({ data: [{ id: 1, plate: 'ABC1234' }], total: 1, page: 1, pageSize: 10 }),
          },
        },
      ],
    });

    const service = TestBed.inject(VehiclesStateService);
    service.updateFilters({ plate: 'ABC' });

    setTimeout(() => {
      expect(service.total()).toBe(1);
      expect(service.vehicles()[0].plate).toBe('ABC1234');
      done();
    }, 300);
  });
});
