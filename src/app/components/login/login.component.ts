import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showOptions = false; 
  //emailUser: string = "koverem157@iridales.com";
  //passwordUser: string = "martin";
  emailUser: string = "joheka9136@dxirl.com";
  passwordUser: string = "martin";

  optionsLogins = "PACIENTE";
  constructor(private router: Router, private firebaseService: FirebaseService)
  {

  }

  goTo(path: string)
  {
    this.router.navigateByUrl(path);
  }

    

  toggleOptions() 
  {
    this.showOptions = !this.showOptions;
    
  }

  changeOptionsSpecility(speciality: string)
  {
    switch(speciality)
    {
      case "Especialista":
        this.optionsLogins = "ESPECIALISTA"
        break;
      case "Paciente":
        this.optionsLogins = "PACIENTE";
        break;
    }
    this.toggleOptions();
  }

async loginUser() {
  try {
    const credential = await this.firebaseService.signIn(this.emailUser, this.passwordUser);
    const user = credential.user;

    if (!user.emailVerified) {
      alert("Debés verificar tu correo electrónico antes de ingresar.");
      await this.firebaseService.signOut();
      return;
    }

    const perfil = this.optionsLogins;

    if (perfil === "PACIENTE") {
      const userDoc = await this.firebaseService.getUserByUID(user.uid, "users");

      if (userDoc && userDoc.autorization === false) {
        alert("Tu cuenta aún no fue autorizada por un administrador.");
        await this.firebaseService.signOut();
        return;
      }

      // Si está autorizado o no tiene ese campo, ingresa
      this.router.navigateByUrl("home");
    }

    else if (perfil === "ESPECIALISTA") {
      const autorizado = await this.firebaseService.verifySpecialistAutorization(user.uid);

      if (autorizado) {
        this.router.navigateByUrl("home");
      } else {
        alert("Tu cuenta de especialista aún no fue aprobada por un administrador.");
        await this.firebaseService.signOut();
      }
    } 

    else {
      alert("Tipo de perfil no reconocido.");
      await this.firebaseService.signOut();
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Usuario o contraseña incorrectos.");
  }
}
}
