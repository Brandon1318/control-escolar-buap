import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import {MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})

export class AlumnosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  //para la tabla, dividimos el nombre en first_name y last_name
  displayedColumns: string[] = ['matricula', 'first_name', 'last_name', 'email', 'fecha_nacimiento', 'telefono', 'curp', 'rfc', 'editar', 'eliminar'];

  dataSource = new MatTableDataSource<DatosAlumno>([]);

  private _paginator: MatPaginator;
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    if (this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  private _sort: MatSort;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this._sort = sort;
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  //Sirve para renderizar todo el dom de la aplicacion
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    // Filtro solo para nombre
    this.dataSource.filterPredicate = (data: DatosAlumno, filter: string) => {
      // Leemos first_name y last_name directamente del objeto 'data'
      const nombreCompleto = (data.first_name + ' ' + data.last_name).toLowerCase();
      return nombreCompleto.includes(filter);
    };

    //ordenamiento por nombre, apellido y matricula
    this.dataSource.sortingDataAccessor = (data: DatosAlumno, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'matricula': return data.matricula;
        case 'first_name': return data.first_name;
        case 'last_name': return data.last_name;
        default: return (data as any)[sortHeaderId];
      }
    };
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    //Validar que haya inicio de sesión
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Llama a la función de obtener alumnos
    this.obtenerAlumnos();
  }

  //función para obtener Alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista alumnos: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {

          this.lista_alumnos.forEach(usuario => {
            if (usuario.user) {
              usuario.first_name = usuario.user.first_name;
              usuario.last_name = usuario.user.last_name;
              usuario.email = usuario.user.email;
            }
          });

          // Actualiza el dataSource existente
          this.dataSource.data = this.lista_alumnos as DatosAlumno[];

          if (this._sort) {
            this.dataSource.sort = this._sort;
          }
          if (this._paginator) {
            this.dataSource.paginator = this._paginator;
          }
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  //función para aplicar el filtro de busqueda
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    const userId = Number(this.facadeService.getUserId());

    //Validamos permisos el Admin pasa siempre
    //alumno solo pasa si su ID coincide con el que quiere editar.
    if (this.rol === 'administrador' || (this.rol === 'alumno' && userId === idUser)) {
       //ruta de la endpoint
      this.router.navigate(['registro-usuarios/alumnos/'+idUser]);
    } else {
      alert("No tienes permisos para editar los datos de otro alumno.");
    }
  }

  // Aquí va la lógica para eliminar alumnos
  public delete(idUser: number) {
    // Obtenemos el ID del usuario logueado
    const userId = Number(this.facadeService.getUserId());
    // Validamos permisos: Admin borra a todos, Alumno solo a sí mismo
    if (this.rol === 'administrador' || this.rol === 'maestro' || (this.rol === 'alumno' && userId === idUser)) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' },//Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente.");
          // Recargar página
          window.location.reload();
        } else {
          alert("Alumno no se ha podido eliminar.");
          console.log("No se eliminó el alumno");
        }
      });
    } else {
      alert("No tienes permisos para eliminar este alumno.");
    }
  }
}

//Esto va fuera de la llave que cierra la clase
export interface DatosAlumno {
  id: number,
  user: any;
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  curp: string;
  rfc: string;
}
