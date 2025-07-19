import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({ width: '100%' }) // sin position: absolute
      ], { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease', style({ transform: 'translateX(-100%)', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          style({ transform: 'translateX(100%)', opacity: 0 }),
          animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
        ], { optional: true })
      ])
    ])
  ])
  ]
})
export class HomeComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
