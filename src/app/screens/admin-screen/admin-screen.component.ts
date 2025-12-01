import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import {MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_admins: any[] = [];
  public rol: string = "";

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí, se obtiene el tipo de usuario
    this.name_user = this.facadeService.getUserCompleteName();

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idUser: number) {
      // ruta de la endpoint
      this.router.navigate(['registro-usuarios/administrador/'+idUser]);
  }

  // Lógica para eliminar
  public delete(idUser: number) {
  // Obtenemos el ID del usuario logueado
  const userId = Number(this.facadeService.getUserId());
  // Validamos permisos: Solo un admin puede borrar
  if (this.rol === 'administrador') {
    //evita que el administrador se borre a sí mismo
    if (userId === idUser) {
      alert("No puedes eliminar tu propia cuenta de administrador.");
      return; // Detiene la función
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idUser, rol: 'administrador' }, //Se pasan valores a través del componente
      height: '288px',
      width: '328px',
    });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
        console.log("Administrador eliminado");
        alert("Administrador eliminado correctamente.");
        // Recargar página
         window.location.reload();
      } else {
          alert("Administrador no se ha podido eliminar.");
          console.log("No se eliminó el administrador");
        }
      });
    } else {
        alert("No tienes permisos para eliminar administradores.");
    }
  }
}
