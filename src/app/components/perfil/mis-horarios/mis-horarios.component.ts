import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../../../services/firebase.service';
@Component({
  selector: 'app-mis-horarios',
  imports: [FormsModule, CommonModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  templateUrl: './mis-horarios.component.html',
  styleUrl: './mis-horarios.component.css'
})
export class MisHorariosComponent implements OnInit{

startHour = "";
endHour = "";
startHourSecondSpeciality = ""
endHourSecondSpeciality = ""

user: any;
 constructor(private firebaseService: FirebaseService)
  {
  }
  async saveSchedule() 
  {
    let data;
    
    if(this.user.secondSpeciality != "")
    {
      data = 
      {
        startHour: this.startHour,
        endHour: this.endHour,
        startHourSecondSpeciality: this.startHourSecondSpeciality,
        endHourSecondSpeciality: this.endHourSecondSpeciality
      }
    }
    else
    {
      
      data = 
      {
        startHour: this.startHour,
        endHour: this.endHour
      }

    }



    await this.firebaseService.updateUser(this.user.id, data);
  }

 async ngOnInit() 
  {
    this.user = await this.firebaseService.getUserLogged();
    this.startHour = this.user?.startHour || '';
    this.endHour = this.user?.endHour || '';
    this.startHourSecondSpeciality = this.user?.startHourSecondSpeciality || '';
    this.endHourSecondSpeciality = this.user?.endHourSecondSpeciality || '';
  }

}
