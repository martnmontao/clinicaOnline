import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  if (filter === "Especialista") {
    this.firebaseService.getSpecifyUsers("profile", this.selectedFilter, "users").then(answer => {
      this.usersList = answer;

      setTimeout(() => {
        this.loading = false;
      }, 500);
    });
  } else if (filter === "Paciente") {
    this.firebaseService.getSpecifyUsers("profile", this.selectedFilter, "users").then(answer => {
      this.usersList = answer;

      setTimeout(() => {
        this.loading = false;
      }, 500);
    });
  }
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
      const emailSent = await this.firebaseService.verifyEmailUser(user);

      if (!emailSent) 
      {
       
        return;
      }

      let data: any;

      if (this.optionsLogins === "PACIENTE") 
      {
        data = {
          uid: user.uid,
          nameUser: this.nameUser,
          lastnameUser: this.lastNameUser,
          ageUser: this.ageUser,
          documentUser: this.documentUser,
          socialWorkUser: this.socialWorkUser,
          imagesUser: this.imagesPreview,
          emailUser: this.emailUser,
          profile: "Paciente"
        };

        await this.firebaseService.addDocument(data, "users");

       
      }else 
      {
       
        data = {
          uid: user.uid,
          nameUser: this.nameUser,
          lastNameUser: this.lastNameUser,
          ageUser: this.ageUser,
          documentUser: this.documentUser,
          imagesUser: this.imagesPreview,
          speciality: this.speciality,
          secondSpeciality: this.secondSpeciality,
          profile: "Especialista",
          autorization: false,
          emailUser: this.emailUser,
        };

        await this.firebaseService.addDocument(data, "users");

       
      }

      await this.firebaseService.signOut(); 
    }
  }catch (error) 
  {
    console.error("Error al registrar:", error);
    
  }
}
}
