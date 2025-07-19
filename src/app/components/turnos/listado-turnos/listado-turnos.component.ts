import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-listado-turnos',
  imports: [FormsModule, CommonModule],
  templateUrl: './listado-turnos.component.html',
  styleUrl: './listado-turnos.component.css'
})
export class ListadoTurnosComponent implements OnInit {
 specialitiesList: string[] = [
    'Clínica médica',
    'Cardiología',
    'Cirugía General',
    'Ginecología',
    'Pediatría',
    'Dermatología',
    'Neurología',
    'Traumatología',
    'Otorrinolaringología',
    'Hemoterapia'
  ];
  
  specialistsList: any[] = [];
  selectedSpeciality: string = '';
  appointmentsList: any[] = [];
  selectedSpecialistUid: string = '';
  constructor(private firebaseService: FirebaseService)
  {

  }

  ngOnInit(): void {
    
  }



  selectSpeciality(speciality: string)
  {
     
    this.firebaseService.getSpecifyUsers('speciality', speciality, 'users').then(answer => {
      this.specialistsList = answer;
    });
      this.selectedSpeciality = speciality;
      this.selectedSpecialistUid = ''; 
  }

  selectSpecialist(specialist:any)
  {
    this.selectedSpecialistUid = specialist.uid;
  }


}
