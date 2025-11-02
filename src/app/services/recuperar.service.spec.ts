import { TestBed } from '@angular/core/testing';

import { RecuperarService } from './recuperar.service';

describe('RecuperarService', () => {
  let service: RecuperarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecuperarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
