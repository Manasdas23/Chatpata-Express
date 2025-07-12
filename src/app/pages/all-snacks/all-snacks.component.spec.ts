import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSnacksComponent } from './all-snacks.component';

describe('AllSnacksComponent', () => {
  let component: AllSnacksComponent;
  let fixture: ComponentFixture<AllSnacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSnacksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSnacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
