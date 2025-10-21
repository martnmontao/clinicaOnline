import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { MisTurnosEspecialistaComponent } from './components/turnos/mis-turnos-especialista/mis-turnos-especialista.component';
import { ListadoTurnosComponent } from './components/turnos/listado-turnos/listado-turnos.component';
import { MisTurnosPacienteComponent } from './components/turnos/mis-turnos-paciente/mis-turnos-paciente.component';
import { SolicitarTurnoComponent } from './components/turnos/solicitar-turno/solicitar-turno.component';
import { MiPerfilComponent } from './components/perfil/mi-perfil/mi-perfil.component';
import { MisHorariosComponent } from './components/perfil/mis-horarios/mis-horarios.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
    data: { animation: 'WelcomePage' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { animation: 'RegisterPage' }
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: 'administration',
        component: AdministrationComponent,
        data: { animation: 'AdministrationPage' }
      },
      {
        path: 'mi-perfil',
        component: MiPerfilComponent,
        data: { animation: 'PerfilPage' }
      },
      {
        path: 'mis-turnos-paciente',
        component: MisTurnosPacienteComponent,
        data: { animation: 'TurnosPage' }
      },
      {
        path: 'solicitar-turno',
        component: SolicitarTurnoComponent,
        data: { animation: 'SolicitarPage' }
      },
      {
        path: 'mis-turnos-especialista',
        component: MisTurnosEspecialistaComponent,
        data: { animation: 'TurnosEspecialistaPage' }
      },
      {
        path: 'listado-turnos',
        component: ListadoTurnosComponent,
        data: { animation: 'ListadoTurnosPage' }
      },
      {
        path: 'mis-horarios',
        component: MisHorariosComponent,
        data: { animation: 'HorariosPage' }
      },
      {
        path: '',
        redirectTo: 'mi-perfil',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];