//importaciones necesarias
import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

//decoradores para el comportamiento de los archivos
@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})

//clase del componente
export class RegistroAlumnosComponent implements OnInit {

  //variables que reciben datos de los componentes padres
  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //variables para controlar los campos de las contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  //variables de estado
  public alumno: any = {};
  public token: string = "";
  public errors: any = {};
  public editar: boolean = false;
  public idUser: Number = 0;

  //aqui agregamos las inyectamos los servicios
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    //El primer if valida si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      // Asignamos a nuestra variable global el valor del ID que viene por la URL
     this.idUser = this.activatedRoute.snapshot.params['id'];
     console.log("ID User: ", this.idUser);

      this.alumno = this.datos_user;
    }else{
      // Si no va a this.editar, entonces inicializamos el JSON para registro nuevo
        this.alumno = this.alumnosService.esquemaAlumno();
        this.alumno.rol = this.rol;
        this.token = this.facadeService.getSessionToken();
    }
    // Imprimir datos en consola
    console.log("Datos alumno: ", this.alumno);
 }

  public regresar() {
    this.location.back();
  }

  //validamos datos del formulario y el registro por medio del boton
  public registrar() {
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if (Object.keys(this.errors).length > 0) {

      //detiene si hay errores
      return false;
    }

    //verificamos si las contraseñas coinciden
    if (this.alumno.password == this.alumno.confirmar_password) {

      //si pasa todas las validaciones, se registra el alumno
      this.alumnosService.registrarAlumno(this.alumno).subscribe({
        next: (response: any) => {

          //aqui se hace la ejecución del servicio si todo es correcto
          alert('Alumno registrado con éxito');
          console.log("Alumno registrado", response);

          //si el login fue correcto y existe un token nos manda a la lista de alumnos
          if (this.token && this.token !== "") {
            this.router.navigate(["alumnos"]);
          } else {
            //sino, nos regresa al login
            this.router.navigate(['/']);
          }
        },

        error: (error: any) => {

          //manejo de los errores de la API
          if (error.status === 400 && error.error.message) {

            //muestra error si es que el usuario ya existente
            alert(error.error.message);
          } else if (error.status === 422) {

            //errores de validacion
            this.errors = error.error.errors;
          } else {

            //se muesta otro tipo de error
            alert('Error al registrar el alumno. Revisa la consola.');
            console.error(error);
          }
        }
      });

    } else {
      //maneja las contraseñas que no coinciden
      alert("Las contraseñas no coinciden");
      this.alumno.password = "";
      this.alumno.confirmar_password = "";
    }
  }

  //actualiza los datos existentes del alumno
    public actualizar() {
      // Validación de los datos
      this.errors = {};
      this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
      if(Object.keys(this.errors).length > 0){
        return false;
    }

    // Ejecutamos el servicio de actualización
    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
    (response: any) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Alumno actualizado exitosamente");
        console.log("Alumno actualizado: ", response);
        this.router.navigate(["alumnos"]); // Redirige a lista de alumnos
      },
      (error: any) => {
        // Manejar errores de la API
        alert("Error al actualizar alumno");
        console.error("Error al actualizar alumno: ", error);
    }
    );
  }

  //funciones para la contraseñas, son para mostrar el icono del ojo
  //para mostrar y ocultar la contraseña
  showPassword() {
    if (this.inputType_1 == 'password') {
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar() {
    if (this.inputType_2 == 'password') {
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //funcion para detectar el cambio de fecha
  public changeFecha(event: any) {
    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.alumno.fecha_nacimiento);
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    //permite solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

  //funciones para validar el email, rfc, ocupacion y demas
  validarEmail(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[a-zA-Z0-9@.\-_]$/;

    if (!regex.test(char)) {
      event.preventDefault();
    }
  }

  soloLetrasYNumeros(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[a-zA-Z0-9]$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  }
}
