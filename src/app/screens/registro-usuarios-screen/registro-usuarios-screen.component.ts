import { AlumnosService } from './../../services/alumnos.service';
import { MaestrosService } from './../../services/maestros.service';
import { AdministradoresService } from './../../services/administradores.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo : string = "registro-usuarios";
  public user : any = {};
  public editar : boolean = false;
  public rol : string = "";
  public idUser : number = 0;

  // Banderas
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
  ) { }

  ngOnInit(): void {
    this.user.tipo_usuario = '';

    // 1. Detección de ID
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
    }

    // 2. Detección de Rol
    if(this.activatedRoute.snapshot.params['rol'] != undefined){
      this.rol = this.activatedRoute.snapshot.params['rol'];
      console.log("Rol detectado: ", this.rol);
    }

    // 3. Decisión de carga:
    // Si es edicion, pedimos los datos primero y las banderas se activarán cuando lleguen en obtenerUserByID
    if(this.editar){
       this.obtenerUserByID();
    } else {
       // Si es un registro nuevo, activamos las banderas inmediatamente para mostrar el formulario vacío
       this.activarFormularioPorRol();
    }
  }

  //activa el formulario correcto
  public activarFormularioPorRol() {
    if(this.rol == "administrador"){
      this.isAdmin = true;
      this.tipo_user = "administrador";
      this.user.tipo_usuario = "administrador";
    } else if(this.rol == "maestros"){
      this.isMaestro = true;
      this.tipo_user = "maestros";
      this.user.tipo_usuario = "maestros";
    } else if(this.rol == "alumnos"){
      this.isAlumno = true;
      this.tipo_user = "alumnos";
      this.user.tipo_usuario = "alumnos";
    }
  }

  public obtenerUserByID() {
    console.log("Obteniendo usuario: ", this.rol, this.idUser);
    if(this.rol == "administrador"){
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;

          //se activa la bandera y el tipo, cuando ya tenemos los datos
          this.tipo_user = "administrador";
          this.isAdmin = true;
        }, (error) => { alert("Error al obtener admin"); }
      );
    } else if(this.rol == "maestros"){
      this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;

          //se activa la bandera y el tipo, cuando ya tenemos los datos
          this.tipo_user = "maestros";
          this.isMaestro = true;
        }, (error) => { alert("Error al obtener maestro"); }
      );
    } else if(this.rol == "alumnos"){
      this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;

          //se activa la bandera y el tipo, cuando ya tenemos los datos
          this.tipo_user = "alumnos";
          this.isAlumno = true;
        }, (error) => { alert("Error al obtener alumno"); }
      );
    }
  }

  public radioChange(event: MatRadioChange) {
    this.isAdmin = false;
    this.isAlumno = false;
    this.isMaestro = false;

    if(event.value == "administrador"){
      this.isAdmin = true;
      this.tipo_user = "administrador";
    } else if (event.value == "alumnos"){
      this.isAlumno = true;
      this.tipo_user = "alumnos";
    } else if (event.value == "maestros"){
      this.isMaestro = true;
      this.tipo_user = "maestros";
    }
  }

  public goBack() {
    this.location.back();
  }
}
