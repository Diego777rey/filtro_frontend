import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabService, Tab } from '../../core/services/tab.service';

@Component({
  selector: 'app-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabContainerComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  tabs: Tab[] = [];

  constructor(
    private tabService: TabService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tabService.tabs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tabs => {
        this.tabs = tabs;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabClick(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      this.router.navigate([tab.route]);
    }
  }

  onTabClose(tabId: string): void {
    this.tabService.closeTab(tabId);
  }


  trackByTabId(index: number, tab: Tab): string {
    return tab.id;
  }
}
