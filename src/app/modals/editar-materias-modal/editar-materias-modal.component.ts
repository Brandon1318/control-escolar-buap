import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-materias-modal',
  templateUrl: './editar-materias-modal.component.html',
  styleUrls: ['./editar-materias-modal.component.scss']
})
export class EditarMateriasModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EditarMateriasModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  public cerrar_modal() {
    this.dialogRef.close({ isEdit: false });
  }

  public editarMateria() {
    // Cerramos el modal enviando true para que el componente padre ejecute la actualización
    this.dialogRef.close({ isEdit: true });
  }

}
