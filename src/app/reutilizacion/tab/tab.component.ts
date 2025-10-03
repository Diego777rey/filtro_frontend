import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Tab } from '../../core/services/tab.service';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  @Input() tab!: Tab;
  @Output() tabClick = new EventEmitter<string>();
  @Output() tabClose = new EventEmitter<string>();

  onTabClick(): void {
    this.tabClick.emit(this.tab.id);
  }

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.tabClose.emit(this.tab.id);
  }
}
