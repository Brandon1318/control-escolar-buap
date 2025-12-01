//importaciones
import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';

//decoradores para el comportamiento de los archivos
@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})

//variables de la clase, guardan la informacion del componentes
export class RegistroMaestrosComponent implements OnInit {

  //variables que reciben datos de los componentes padres
  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //variables para controlar los campos de las contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //arrays para las areas y materias
  public areas: any[] = [
    { value: 'Desarrollo Web', viewValue: 'Desarrollo Web' },
    { value: 'Programación', viewValue: 'Programación' },
    { value: 'Bases de datos', viewValue: 'Bases de datos' },
    { value: 'Redes', viewValue: 'Redes' },
    { value: 'Matemáticas', viewValue: 'Matemáticas' },
  ];

  //son los datos que el usuario puede elegir
  public materias: any[] = [
    { value: 'Aplicaciones Web', nombre: 'Aplicaciones Web' },
    { value: 'Programación 1', nombre: 'Programación 1' },
    { value: 'Bases de datos', nombre: 'Bases de datos' },
    { value: 'Tecnologías Web', nombre: 'Tecnologías Web' },
    { value: 'Minería de datos', nombre: 'Minería de datos' },
    { value: 'Desarrollo móvil', nombre: 'Desarrollo móvil' },
    { value: 'Estructuras de datos', nombre: 'Estructuras de datos' },
    { value: 'Administración de redes', nombre: 'Administración de redes' },
    { value: 'Ingeniería de Software', nombre: 'Ingeniería de Software' },
    { value: 'Administración de S.O.', nombre: 'Administración de S.O.' },
  ];

  //constructor para inyectar todos los servicios
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    // El primer if valida si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      // Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User (Maestro): ", this.idUser);

        this.maestro = this.datos_user;

      } else {
        // Si no va a editar, inicializamos el JSON para registro nuevo
        this.maestro = this.maestrosService.esquemaMaestro();
        this.maestro.rol = this.rol;
        this.token = this.facadeService.getSessionToken();
      }
      // Imprimir datos en consola
      console.log("Datos Maestro: ", this.maestro);
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    //validaciones del formulario
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if (Object.keys(this.errors).length > 0) {

      //detiene si hay errores
      return false;
    }

    //verificamos si las contraseñas coinciden
    if (this.maestro.password == this.maestro.confirmar_password) {

      //si pasa todas las validaciones, se registra el maestro
      this.maestrosService.registrarMaestro(this.maestro).subscribe({
        next: (response: any) => {

          //aqui se hace la ejecución del servicio si todo es correcto
          alert('Maestro registrado con éxito');
          console.log("Maestro registrado", response);

          //si el login fue correcto y existe un token nos manda a la lista de alumnos
          if (this.token && this.token !== "") {
            this.router.navigate(["maestros"]);
          } else {
            //sino, nos regresa al login
            this.router.navigate(['/']);
          }
        },
        error: (error: any) => {

          //manejo de errores de la API
          if (error.status === 400 && error.error.message) {

            //muestra error de usuario ya existente
            alert(error.error.message);
          } else if (error.status === 422) {

            //errores de validación
            this.errors = error.error.errors;
          } else {
            //mostramos otro tipo de error
            alert('Error al registrar el maestro. Revisa la consola.');
            console.error(error);
          }
        }
      });

    } else {
      //maneja las contraseñas que no coinciden
      alert("Las contraseñas no coinciden");
      this.maestro.password = "";
      this.maestro.confirmar_password = "";
    }
  }

  //actualiza los datos existentes del maestro
  public actualizar() {
    // Validación de los datos
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Ejecutamos el servicio de actualización
    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response: any) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Maestro actualizado exitosamente");
        console.log("Maestro actualizado: ", response);
        this.router.navigate(["maestros"]); // Redirige a lista de maestros
      },
      (error: any) => {
        // Manejar errores de la API
        alert("Error al actualizar maestro");
        console.error("Error al actualizar maestro: ", error);
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
    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }

  //funcion para los checkbox, indica cuando se seleccionan
  public checkboxChange(event: any) {
    if (event.checked) {
      this.maestro.materias_json.push(event.source.value)
    } else {
      this.maestro.materias_json.forEach((materia: any, i: number) => {
        if (materia == event.source.value) {
          this.maestro.materias_json.splice(i, 1)
        }
      });
    }
    console.log("Array materias: ", this.maestro.materias_json);
  }

  public revisarSeleccion(nombre: string) {
    if (this.maestro.materias_json) {
      var busqueda = this.maestro.materias_json.find((element: any) => element == nombre);
      if (busqueda != undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
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
