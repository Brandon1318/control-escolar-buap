import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import {MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})

export class MaestrosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  displayedColumns: string[] = ['id_trabajador', 'first_name', 'last_name', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

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

  ngAfterViewInit() {

    // Filtro solo por nombre
    this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
      const nombreCompleto = (data.first_name + ' ' + data.last_name).toLowerCase();
      return nombreCompleto.includes(filter);
    };

    //ordenamiento por nombre, apellido y matricula
    this.dataSource.sortingDataAccessor = (data: DatosUsuario, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'id_trabajador': return data.id_trabajador;
        case 'first_name': return data.first_name;
        case 'last_name': return data.last_name;
        default: return (data as any)[sortHeaderId];
      }
    };
  }

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    this.obtenerMaestros();
  }

  // funcion para obtener maestros del objeto
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        if (this.lista_maestros.length > 0) {
          this.lista_maestros.forEach(usuario => {
            if (usuario.user) {
              usuario.first_name = usuario.user.first_name;
              usuario.last_name = usuario.user.last_name;
              usuario.email = usuario.user.email;
            }
          });

          // Actualiza el dataSource existente
          this.dataSource.data = this.lista_maestros as DatosUsuario[];

          if (this._sort) {
            this.dataSource.sort = this._sort;
          }
          if (this._paginator) {
            this.dataSource.paginator = this._paginator;
          }
        }
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  // Esta función para aplicar el filtro
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    const userId = Number(this.facadeService.getUserId());

    //Validamos permisos
    //Si es admin, pasa siempre
    //s es maestro SOLO pasa si su ID  coincide con el ID de la fila
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userId === idUser)) {
      // ruta de la endpoint
      this.router.navigate(['registro-usuarios/maestros/'+idUser]);
    } else {
      alert("No tienes permisos para editar los datos de otro maestro.");
    }
  }

  // Lógica para eliminar
  public delete(idUser: number) {
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userId === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'maestro'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Maestro eliminado");
        alert("Maestro eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Maestro no se ha podido eliminar.");
        console.log("No se eliminó el maestro");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este maestro.");
    }
  }
}

export interface DatosUsuario {
  id: number,
  user: any;
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}
