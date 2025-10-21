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
  showPhotos = false;
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



 goTo(route: string) {
  this.router.navigate([route]);
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

  

  openInput() 
  {
    const input = document.getElementById('input-file') as HTMLInputElement;
    input.click();
   
  }

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const archivos = Array.from(input.files);

    archivos.forEach((archivo) => {
      this.images.push(archivo);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          
          const maxWidth = 400; 
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);


          this.imagesPreview.push(compressedBase64);
        };
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
        profile: "Paciente",
        imageSelected: this.imagesPreview[0]
      };

    } else {
      data = {
        uid: user.uid,
        nameUser: this.nameUser,
        lastnameUser: this.lastNameUser,
        ageUser: this.ageUser,
        documentUser: this.documentUser,
        imagesUser: this.imagesPreview,
        speciality: this.speciality,
        secondSpeciality: this.secondSpeciality,
        profile: "Especialista",
        autorization: false,
        emailUser: this.emailUser,
        imageSelected: this.imagesPreview[0]
      };
    }

    await this.firebaseService.addDocument(data, "users");
   
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




