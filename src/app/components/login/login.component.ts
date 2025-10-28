import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm!: FormGroup;
  showOptions = false; 
  emailUser: string = "hiwec41220@fenexy.com";
  passwordUser: string = "martin";
  textUserChoice: string = "";
  optionsLogins = "PACIENTE";
  constructor(private router: Router, private firebaseService: FirebaseService,  private fb: FormBuilder)
  {

  }

 
  get f() {
    return this.loginForm.controls;
  }

goTo(route: string) {
  this.router.navigate([route]);
}

    ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailUser: ['', [Validators.required, Validators.email]],
      passwordUser: ['', [Validators.required, Validators.minLength(6)]]
    });
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
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      const errores: string[] = [];

      if (this.f['emailUser'].hasError('required')) errores.push('El correo electrónico es obligatorio.');
      else if (this.f['emailUser'].hasError('email')) errores.push('El correo electrónico no es válido.');

      if (this.f['passwordUser'].hasError('required')) errores.push('La contraseña es obligatoria.');
      else if (this.f['passwordUser'].hasError('minlength')) errores.push('La contraseña debe tener al menos 6 caracteres.');

      Swal.fire({
        icon: 'error',
        title: 'Por favor corrige los siguientes errores',
        html: errores.join('<br>'),
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const { emailUser, passwordUser } = this.loginForm.value;

    try {
      const credential = await this.firebaseService.signIn(emailUser, passwordUser);
      const user = credential.user;

      if (!user.emailVerified) {
        Swal.fire({
          icon: 'warning',
          title: 'Correo no verificado',
          text: 'Debes verificar tu correo electrónico antes de ingresar.',
          confirmButtonText: 'Aceptar'
        });
        await this.firebaseService.signOut();
        return;
      }

      const perfil = this.optionsLogins;

      if (perfil === 'PACIENTE') {
        const userDoc = await this.firebaseService.getUserByUID(user.uid, 'users');

        if (userDoc && userDoc.autorization === false) {
          Swal.fire({
            icon: 'info',
            title: 'Cuenta no autorizada',
            text: 'Tu cuenta aún no fue autorizada por un administrador.',
            confirmButtonText: 'Aceptar'
          });
          await this.firebaseService.signOut();
          return;
        }

        this.router.navigateByUrl('home');
      } 
      else if (perfil === 'ESPECIALISTA') {
        const autorizado = await this.firebaseService.verifySpecialistAutorization(user.uid);

        if (autorizado) {
          this.router.navigateByUrl('home');
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Cuenta pendiente',
            text: 'Tu cuenta de especialista aún no fue aprobada por un administrador.',
            confirmButtonText: 'Aceptar'
          });
          await this.firebaseService.signOut();
        }
      } 
      else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Tipo de perfil no reconocido.',
          confirmButtonText: 'Aceptar'
        });
        await this.firebaseService.signOut();
      }

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      let mensaje = 'Ocurrió un error al iniciar sesión.';

      switch (error.code) {
        case 'auth/user-not-found':
          mensaje = 'El usuario no existe.';
          break;
        case 'auth/wrong-password':
          mensaje = 'Contraseña incorrecta.';
          break;
        case 'auth/invalid-email':
          mensaje = 'Correo electrónico inválido.';
          break;
        case 'auth/too-many-requests':
          mensaje = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        case 'auth/invalid-credential':
          mensaje = 'Las credenciales son inválidas. No existe un usuario con esas credenciales.';

          break;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: mensaje,
        confirmButtonText: 'Aceptar'
      });
    }
  }

}
