import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showOptions = false; 
  showSpecialities = false;
  showCaptcha = false;
  
  optionsLogins = "PACIENTE";
  labelInput = "Obra social";
 
  images: File[] = [];
  imagesPreview: string[] = [];
  
  num1: number = 0;
  num2: number = 0;
  respuesta: string = '';
  mensaje: string = '';
  colorMensaje: string = '';
  nameUser: string = "";
  lastNameUser: string = "";
  ageUser: string = "";
  emailUser: string = "";
  passwordUser: string = "";
  socialWorkUser: string = "";
  documentUser: string = "";
  speciality: string = "";
  secondSpeciality: string = "";
  

  constructor(private router: Router, private firebaseService: FirebaseService)
  {
    
  }



  goTo(path: string)
  {
    this.router.navigateByUrl(path);
  }
  showContainer(container: string)
  {
    switch(container)
    {
      case "captcha":
        this.showCaptcha = !this.showCaptcha;
        break
    }
  }

   toggleOptions() 
  {
    this.showOptions = !this.showOptions;
    
  }

  changeOptionsSpecility(speciality: string)
  {
    this.nameUser = "";
    this.lastNameUser = "";
    this.ageUser = "";
    this.emailUser = "";
    this.passwordUser = "";
    this.socialWorkUser = "";
    this.documentUser = "";
    this.speciality = "";
    this.secondSpeciality = "";

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
    }
    this.toggleOptions();
  }

  openInput() 
  {
    const input = document.getElementById('input-file') as HTMLInputElement;
    input.click();
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

async registerUser() {
  let data: any;

  const userCredential = await this.firebaseService.signUp(this.emailUser, this.passwordUser);
  const user = userCredential.user;

  if (user) {
    // Enviar correo de verificación para cualquier tipo de usuario
    const emailSent = await this.firebaseService.verifyEmailUser(user);
    if (!emailSent) return;

    if (this.optionsLogins === "PACIENTE") {
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

    } else {
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
    }

    await this.firebaseService.addDocument(data, "users");
    await this.firebaseService.signOut();
    this.router.navigateByUrl("login");
  }
}


  ngOnInit(): void {
    this.generarCaptcha();
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




