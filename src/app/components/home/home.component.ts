import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        width: '100%',
        position: 'absolute', // Esto asegura que las vistas se superpongan para animar bien
        top: 0,
        left: 0
      })
    ], { optional: true }),

    group([
      // El componente que se va sale hacia la izquierda
      query(':leave', [
        animate('300ms ease', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ], { optional: true }),

      // El componente que entra viene desde la derecha
      query(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ])
])
  ]
})
export class HomeComponent  implements OnInit{

  userLogged: any;
  navegationCounter:number = 0;
  showAside: boolean = false;
  constructor(private FirebaseService: FirebaseService, private router:Router)
  {
    
  }
  prepareRoute(outlet: RouterOutlet, ) {
    return outlet?.activatedRouteData?.['animation'];
  }

  async ngOnInit(){
    this.userLogged = await this.FirebaseService.getUserLogged(); 
    console.log(this.userLogged)
  }

  navigateRoutes(number: number) {
  let routes: string[] = [];

  if (this.userLogged.profile === "Especialista") {
    routes = [
      '/home/mi-perfil', 
      '/home/mis-horarios', 
      '/home/mis-turnos-especialista'
    ];
  } else if (this.userLogged.profile === "Paciente") {
    routes = [
      '/home/mis-turnos-paciente'
    ];
  } else {
    routes = [
      '/home/listado-turnos'
    ];
  }

  const total = routes.length;
  this.navegationCounter = (this.navegationCounter + number + total) % total;

  this.router.navigate([routes[this.navegationCounter]]);

 
}


  async logOut()
  {
    await this.FirebaseService.signOut();
  }
}
