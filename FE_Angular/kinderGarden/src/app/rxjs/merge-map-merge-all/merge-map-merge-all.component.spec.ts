import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeMapMergeAllComponent } from './merge-map-merge-all.component';

describe('MergeMapMergeAllComponent', () => {
  let component: MergeMapMergeAllComponent;
  let fixture: ComponentFixture<MergeMapMergeAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergeMapMergeAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MergeMapMergeAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
