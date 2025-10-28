import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-administration',
  imports: [CommonModule, FormsModule],
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.css'
})
export class AdministrationComponent implements OnInit{

  showOptions = false; 
  showRegister = false;
  showTable = true;
  showPhotos = false;
  showCaptcha = false;
  num1: number = 0;
  num2: number = 0;
  mensaje: string = '';
  colorMensaje: string = '';
  respuesta: string = '';
  optionsLogins = "PACIENTE";
  labelInput = "Obra social";
  showSpecialities = false;
  usersList:any = [];
  selectedFilter: string = "Paciente"
  loading: boolean = false;
  nameUser: string = "";
  lastNameUser: string = "";
  ageUser: string = "";
  emailUser: string = "";
  passwordUser: string = "";
  socialWorkUser: string = "";
  documentUser: string = "";
  speciality: string = "";
  secondSpeciality: string = "";
    images: File[] = [];
  imagesPreview: string[] = [];
    openInput() 
  {
    const input = document.getElementById('input-file') as HTMLInputElement;
    input.click();
  }
  constructor(private firebaseService: FirebaseService)
  {

  }

  ngOnInit(): void {
    this.loading = true; 

    this.firebaseService.getSpecifyUsers("profile", this.selectedFilter, "users").then(answer => 
      {
        this.usersList = answer;
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
      )
  }
  toggleOptions() 
  {
    this.showOptions = !this.showOptions;
    
  }

  showContainer(container: string)
  {
    this.showTable = false;
    this.showRegister = false;
    switch(container)
    {
      case "register":
        this.showRegister = !this.showRegister;
        break;
      case "table":
        this.showTable = !this.showRegister;
        break;
    }
  }



   changeOptionsSpecility(speciality: string)
  {
    switch(speciality)
    {
      case "Especialista":
        this.optionsLogins = "ESPECIALISTA"
        this.labelInput = "Especialidad";
        this.showSpecialities = true;
        
        break;
      case "Paciente":
        this.optionsLogins = "PACIENTE";
        this.labelInput = "Obra social";
        this.showSpecialities = false;
        break;
      case "Administrador":
        this.optionsLogins = "ADMIN";
        this.showSpecialities = false;
        break;
    }
    this.toggleOptions();
  }
   onFileSelected(event: Event) 
 {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivos = Array.from(input.files);

      archivos.forEach((archivo) => {
        this.images.push(archivo);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagesPreview.push(e.target.result); 
        };
        reader.readAsDataURL(archivo); 
      });
    }
}
selectFilter(filter: string) {
  this.selectedFilter = filter;
  this.loading = true;

  this.firebaseService.getSpecifyUsers("profile", this.selectedFilter, "users").then(answer => {
      this.usersList = answer;

      setTimeout(() => {
        this.loading = false;
      }, 500);
    });
}

  autorizateUser(uid:string)
  {
    this.loading = true; 

    this.firebaseService.autorizateUser(uid).then(answer => 
    {
      this.firebaseService.getSpecifyUsers("profile", this.selectedFilter, "users").then(answer => 
      {
        this.usersList = answer;
      
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
     
    )}
    );
  
  }
  async registerUser() 
{
  try 
  {
    const userCredential = await this.firebaseService.signUp(this.emailUser, this.passwordUser);
    const user = userCredential.user;

    if (user) 
      {
      let data: any;

     
        data = {
          uid: user.uid,
          nameUser: this.nameUser,
          lastnameUser: this.lastNameUser,
          ageUser: this.ageUser,
          documentUser: this.documentUser,
          imagesUser: this.imagesPreview,
          emailUser: this.emailUser,
          profile: "Admin"
        };

        await this.firebaseService.addDocument(data, "users");

       
     

      

       
      }

    
    }
  catch (error) 
  {
    console.error("Error al registrar:", error);
    
  }
}

  exportExcel() {
    let data;
    switch(this.selectedFilter)
    {
      case "Paciente":
        data = this.usersList.map((user:any) => ({
        "Perfil": user.profile,
        "Nombre": user.nameUser,
        "Apellido": user.lastnameUser,
        "Documento": user.documentUser,
        "Edad": user.ageUser,
        "Correo electrónico": user.emailUser, 
        "Obra social": user.socialWorkUser
        }));
        break;
      case "Especialista":
         data = this.usersList.map((user:any) => ({
        "Perfil": user.profile,
        "Nombre": user.nameUser,
        "Apellido": user.lastnameUser,
        "Documento": user.documentUser,
        "Edad": user.ageUser,
        "Correo electrónico": user.emailUser, 
        "Especialidad": user.speciality,
        "Segunda especialidad": user.secondSpeciality,
        }));
        break;
    }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = { Sheets: { 'Hoja1': worksheet }, SheetNames: ['Hoja1'] };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob: Blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, this.selectedFilter + 's.xlsx'); // 📂 Se descarga como Excel real
  }

  
  generarCaptcha(): void {
    this.num1 = Math.floor(Math.random() * 10);
    this.num2 = Math.floor(Math.random() * 10);
    this.respuesta = '';
    this.mensaje = '';
  }

  verificarCaptcha(): void {
    const suma = this.num1 + this.num2;
    if (parseInt(this.respuesta) === suma) {
      this.mensaje = '✅ Correcto';
      this.colorMensaje = 'green';
      
      this.registerUser();
      this.showCaptcha = false;

    } else {
      this.mensaje = '❌ Incorrecto, intenta otra vez';
      this.colorMensaje = 'red';
      setTimeout(() => {
        this.generarCaptcha();
        
      }, 1000);
    }
  }
}
