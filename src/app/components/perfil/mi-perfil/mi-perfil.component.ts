import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { MisHorariosComponent } from '../mis-horarios/mis-horarios.component';
import { FormsModule } from '@angular/forms';

//import { variable64 } from "../../assets/img";

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  
  user: any;
  
  startHour = "";
  endHour = "";
  constructor(private firebaseService: FirebaseService)
  {
  }
    
  async ngOnInit() 
  {
    this.user = await this.firebaseService.getUserLogged();
    this.startHour = this.user?.startHour || '';
    this.endHour = this.user?.endHour || '';
  }

  onGeneratePDF()
  {
    
  }

}
