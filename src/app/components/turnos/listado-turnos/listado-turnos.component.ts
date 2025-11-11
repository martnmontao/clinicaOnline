import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { Speciality } from '../../../interfaces/speciality';
import { NombreFormateadoPipe } from '../../../pipes/nombre-formateado.pipe';
import { FiltrarTurnosPipe } from '../../../pipes/filtrar-turnos.pipe';
import { OrdenarPorFechaPipe } from '../../../pipes/ordenar-por-fecha.pipe';
import { EstadoTurnoDirective } from '../../../directives/estado-turno.directive';
@Component({
  selector: 'app-listado-turnos',
  imports: [FormsModule, CommonModule, NombreFormateadoPipe, FiltrarTurnosPipe, OrdenarPorFechaPipe, EstadoTurnoDirective],
  templateUrl: './listado-turnos.component.html',
  styleUrl: './listado-turnos.component.css'
})
export class ListadoTurnosComponent implements OnInit {
 specialitiesList: Speciality[] = [];
  
  specialistsList: any[] = [];
  selectedSpeciality: Speciality = {name: "", startHourWeekend: "", endHourWeekend: "", startHourWork: "", endHourWork: "", specialityImage: ""}
  appointmentsList:any = [];
  selectedSpecialistUid: string = '';
  isLoading = false;
  isLoadingAppointment = false;
  showReview: boolean = false;
  review:string = "";
  patientSelected:any;
  filterValue: string = "";
  constructor(private firebaseService: FirebaseService)
  {

  }

  async ngOnInit() {
    this.isLoadingAppointment = true;
    this.appointmentsList = await this.firebaseService.getCollection('appointments'); // trae todos los turnos
    this.isLoadingAppointment = false;
  }

  showContainer(container: string) {
    if (container === "review") {
      this.showReview = !this.showReview;
      this.review = this.patientSelected?.review || '';
    }
  }

  async changeStateAppointment() {
    if (!this.patientSelected) return;
    await this.firebaseService.updateDocument('appointments', this.patientSelected.id, {
      state: 'Cancelado',
      specialistReview: this.review
    });
  
    this.appointmentsList = await this.firebaseService.getCollection('appointments');
  }

  sendReview() {
    if (this.review && this.review.length > 20) {
      this.changeStateAppointment();
    }
  }
}

  

