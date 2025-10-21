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
  isLoading = false;
  isLoadingAppointment = false;
  showReview: boolean = false;
  review:string = "";
  patientSelected:any;
  
  constructor(private firebaseService: FirebaseService)
  {

  }

  ngOnInit(): void {
    
  }



  async selectSpeciality(speciality: string)
  {
      this.isLoading = true;
      this.specialistsList = [];
      this.appointmentsList = [];
      this.selectedSpeciality = speciality;
      this.selectedSpecialistUid = '';

      const specialistsPrimary = await this.firebaseService.getSpecifyUsers('speciality', speciality, 'users');
      const specialistsSecondary = await this.firebaseService.getSpecifyUsers('secondSpeciality', speciality, 'users');

      
      const combinedMap = new Map();

      [...specialistsPrimary, ...specialistsSecondary].forEach(s => {
        combinedMap.set(s.uid, s); 
      });

      this.specialistsList = Array.from(combinedMap.values());
      setTimeout(() => {

        this.isLoading = false;
      }, 500);

    }

  async selectSpecialist(specialist:any)
  {
    this.selectedSpecialistUid = specialist.uid;
    await this.prepareAppointmentsList();
   
    
  }


  async prepareAppointmentsList()
  {
 
    this.isLoadingAppointment = true;
    
    this.appointmentsList = await this.firebaseService.getAppointments(this.selectedSpecialistUid, this.selectedSpeciality)
    console.log(this.appointmentsList)
    setTimeout(() => {
      
      this.isLoadingAppointment = false;
    }, 1000);
   
  }

  showContainer(container:string)
  {
    switch(container)
    {
      case "review":
        this.showReview = !this.showReview;
        this.review = this.patientSelected.review;
        break;
    }
  }


  async changeStateAppointment()
  {
    
    await this.firebaseService.updateDocument('appointment', this.patientSelected.id, 
      {
        state: 'Cancelado',
        specialistReview: this.review
      }
    )
     
    this.prepareAppointmentsList();
  }

  
  sendReview()
  {
    if(this.review != "" && this.review.length > 20)
    {
      this.changeStateAppointment();
    }
  }

  
}
