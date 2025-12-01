import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];

  // Columnas de MATERIAS (Modificación: Añadimos 'editar' y 'eliminar')
  displayedColumns: string[] = ['nrc', 'nombre', 'seccion', 'dias', 'horario', 'salon', 'programa', 'profesor', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosMateria>([]);

  private _paginator!: MatPaginator;
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    if (this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  private _sort!: MatSort;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this._sort = sort;
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    if(this.rol == 'alumno'){
      this.router.navigate(['home']);
    }

    this.token = this.facadeService.getSessionToken();
    if(!this.token){
      this.router.navigate(["/"]);
    }

    this.dataSource = new MatTableDataSource<DatosMateria>([]);
    this.obtenerMaterias();
  }

  ngAfterViewInit() {
    this.dataSource.filterPredicate = (data: DatosMateria, filter: string) => {
      const dataStr = (data.nrc + ' ' + data.nombre).toLowerCase();
      return dataStr.includes(filter);
    };

    // Ordenamiento por campos de MATERIAS
    this.dataSource.sortingDataAccessor = (data: DatosMateria, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'nrc': return data.nrc;
        case 'nombre': return data.nombre;
        case 'seccion': return data.seccion;
        case 'programa': return data.programa_educativo;
        default: return (data as any)[sortHeaderId];
      }
    };
  }

  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = Array.isArray(response) ? response : [];

        if (this.lista_materias.length > 0) {
          this.dataSource.data = this.lista_materias as DatosMateria[];
        } else {
            console.log("El servidor devolvió una lista vacía [].");
            this.dataSource.data = [];
        }

        if (this._sort) this.dataSource.sort = this._sort;
        if (this._paginator) this.dataSource.paginator = this._paginator;

      }, (error) => {
        console.error("Error al obtener la lista de materias: ", error);

        if (error.status === 401) {
             alert("Sesión expirada. Redirigiendo al login.");
             this.facadeService.destroyUser();
             this.router.navigate(["/"]);
        } else {
             alert("Error al cargar materias. Verifique el backend (Django).");
             this.dataSource.data = [];
        }
      }
    );
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idMateria: number) {
    if (this.rol === 'administrador') {
      this.router.navigate(['registro-materias-screen/' + idMateria]);
    } else {
      alert("Solo los administradores pueden editar materias.");
    }
  }

  public delete(idMateria: number) {
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idMateria, rol: 'materia' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          this.materiasService.eliminarMateria(idMateria).subscribe(
            (res) => {
              alert("Materia eliminada correctamente.");
              this.obtenerMaterias();
            },
            (err) => {
              alert("Error al eliminar materia.");
            }
          );
        }
      });
    } else {
      alert("Solo los administradores pueden eliminar materias.");
    }
  }
}

export interface DatosMateria {
  id: number;
  nrc: string;
  nombre: string;
  seccion: string;
  dias: string[];
  hora_inicio: string;
  hora_final: string;
  salon: string;
  programa_educativo: string;
  profesor: number;
  maestro_data?: any;
  creditos: number;
}
