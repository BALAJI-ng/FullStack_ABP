import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedLatestAllComponent } from './combined-latest-all.component';

describe('CombinedLatestAllComponent', () => {
  let component: CombinedLatestAllComponent;
  let fixture: ComponentFixture<CombinedLatestAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinedLatestAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombinedLatestAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
