import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

export interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: string;
}

@Injectable({
  providedIn: 'root'
})

export class BreakpointService {

  private breakpointSubject = new BehaviorSubject<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'desktop'
  });

  public breakpoint$: Observable<BreakpointState> = this.breakpointSubject.asObservable();

  constructor(private breakpointObserver : BreakpointObserver) {
    this.intializeBreakpoints();
  }


  private intializeBreakpoints() {
    this.breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.XSmall,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).pipe(distinctUntilChanged()).subscribe(result => {
      const breakpoints = result.breakpoints;
      let state: BreakpointState;

      if (breakpoints[Breakpoints.XSmall] || breakpoints[Breakpoints.Small]) {
        state = {
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          breakpoint: 'mobile'
        };
      } else if (breakpoints[Breakpoints.Medium]) {
        state = {
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          breakpoint: 'tablet'
        };
      } else {
        state = {
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          breakpoint: 'desktop'
        };
      }

      this.breakpointSubject.next(state);
    })
  }

  isMobile(): boolean {
    return this.breakpointSubject.value.isMobile;
  }

  isTablet(): boolean {
    return this.breakpointSubject.value.isTablet;
  }

  isDesktop(): boolean {
    return this.breakpointSubject.value.isDesktop;
  } 

  getCurrentBreakpoint(): string {
    return this.breakpointSubject.value.breakpoint;
  }
}
