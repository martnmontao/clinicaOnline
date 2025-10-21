import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, transition, style, query, group, animate } from '@angular/animations';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          })
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
export class AppComponent {
  title = 'clinica';
   prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
