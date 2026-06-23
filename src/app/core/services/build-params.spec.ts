import { TestBed } from '@angular/core/testing';

import { BuildParams } from './build-params';

describe('BuildParams', () => {
  let service: BuildParams;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildParams);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
