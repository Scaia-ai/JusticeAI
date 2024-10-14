import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseChatComponent } from './case-chat.component';

describe('OrderChatComponent', () => {
  let component: CaseChatComponent;
  let fixture: ComponentFixture<CaseChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
