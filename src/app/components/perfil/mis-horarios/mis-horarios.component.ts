import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../../../services/firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-horarios',
  imports: [FormsModule, CommonModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  templateUrl: './mis-horarios.component.html',
  styleUrl: './mis-horarios.component.css'
})
export class MisHorariosComponent implements OnInit{

user: any;
 constructor(private firebaseService: FirebaseService)
  {
  }
  async saveSchedule() {
  try {
    for (let spec of this.user.specialities) {
  
      if (spec.startHourWork < '08:00' || spec.endHourWork > '19:00' || spec.startHourWork > spec.endHourWork) {
        await Swal.fire({
          icon: 'error',
          title: 'Horario inválido',
          text: `Horario de ${spec.name} en Lunes a Viernes debe estar entre 08:00 y 19:00`,
          scrollbarPadding: false,
          confirmButtonText: 'Aceptar', 
          backdrop: false,
          customClass: {
            container: 'swal2-container-absolute',
            popup: 'my-swal-popup'
          }
        });
        return;
      }

      if (spec.startHourWeekend < '08:00' || spec.endHourWeekend > '14:00' || spec.startHourWeekend > spec.endHourWeekend) {
        await Swal.fire({
          icon: 'error',
          title: 'Horario inválido',
          text: `Horario de ${spec.name} en Sábados y Domingos debe estar entre 08:00 y 14:00`,
          scrollbarPadding: false,
          confirmButtonText: 'Aceptar', 
          backdrop: false,
          customClass: {
            container: 'swal2-container-absolute',
            popup: 'my-swal-popup'
          }
        });
        return;
      }
    }


    const data = { specialities: this.user.specialities };
    await this.firebaseService.updateUser(this.user.id, data);

    await Swal.fire({
      icon: 'success',
      title: '¡Horarios guardados!',
      text: 'Los horarios se actualizaron correctamente.',
      timer: 2000,
      showConfirmButton: false,
      scrollbarPadding: false,
      confirmButtonText: 'Aceptar', 
      backdrop: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });

  } catch (error) {
    console.error('❌ Error al guardar los horarios:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al guardar los horarios.',
      scrollbarPadding: false,
      confirmButtonText: 'Aceptar', 
      backdrop: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
  }
}

 async ngOnInit() 
  {
    this.user = await this.firebaseService.getUserLogged();
  }

}
