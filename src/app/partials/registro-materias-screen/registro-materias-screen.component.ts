import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MateriasService } from 'src/app/services/materias.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarMateriasModalComponent } from 'src/app/modals/editar-materias-modal/editar-materias-modal.component';

@Component({
  selector: 'app-registro-materias-screen',
  templateUrl: './registro-materias-screen.component.html',
  styleUrls: ['./registro-materias-screen.component.scss']
})
export class RegistroMateriasScreenComponent implements OnInit {

  public materia: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public idMateria: Number = 0;
  public listaMaestros: any[] = [];
  public token: string = "";

  public diasSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  public programas: any[] = [
    { value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  //variables para controlar los campos de las contraseñas
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private materiasService: MateriasService,
    public dialog: MatDialog
  ) { }

  //funcion par conversion de horas
  public convertirHora12a24(hora12: string): string {
    //Si está vacío, devolvemos cadena vacía
    if (!hora12) return '';

    // Si ya viene limpia o en formato 24h, la devolvemos con segundos
    if (hora12.length === 5 && hora12.includes(':')) {
      return `${hora12}:00`;
    }

    try {
        let [time, modifier] = hora12.split(' ');

        // Verificamos si el formato es válido antes de parsear
        if (!time || !modifier) return '';

        let [hours, minutes] = time.split(':').map(Number);

        if (modifier.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
        } else if (modifier.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }

        const hoursStr = hours.toString().padStart(2, '0');
        //corregimos la tipografía a minutesStr para evitar el error de compilación
        const minutesStr = minutes.toString().padStart(2, '0');

        return `${hoursStr}:${minutesStr}:00`;
    } catch (e) {
        console.error("Error al parsear hora:", e);
        return ''; // Devolvemos cadena vacía en caso de error
    }
  }

  //funcion de hora inversa la paso el profe
  public convertirHora24a12(hora24: string): string {
    if (!hora24) return '';
    let [hours, minutes] = hora24.split(':').map(Number);
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const horasStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${horasStr}:${minutesStr} ${ampm}`;
  }


  ngOnInit(): void {
    if(this.facadeService.getUserGroup() !== 'administrador'){
      alert("Acceso denegado. Solo administradores pueden gestionar materias.");
      this.router.navigate(['home']);
    }

    this.token = this.facadeService.getSessionToken();
    this.materia = this.materiasService.esquemaMateria();

    this.obtenerMaestros();

    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idMateria = this.activatedRoute.snapshot.params['id'];

      this.materiasService.obtenerMateriaPorID(Number(this.idMateria)).subscribe(
        (response)=>{
          this.materia = response;
          if(!this.materia.dias){ this.materia.dias = []; }

          // Al cargar datos en edicion, aseguramos que la hora de la BD (HH:MM:SS) sea HH:MM
          if(this.materia.hora_inicio) this.materia.hora_inicio = this.materia.hora_inicio.substring(0, 5);
          if(this.materia.hora_final) this.materia.hora_final = this.materia.hora_final.substring(0, 5);
        },
        (error)=>{ alert("No se pudo obtener la materia para editar"); }
      );
    }
  }

  public obtenerMaestros(){
    this.materiasService.obtenerListaMaestros().subscribe(
      (response)=>{ this.listaMaestros = response; },
      (error)=>{ console.error("Error al obtener maestros"); }
    );
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if (Object.keys(this.errors).length > 0) return false;

    //prepara los datos y su conversion
    const datosEnviar = { ...this.materia };

    datosEnviar.hora_inicio = this.convertirHora12a24(this.materia.hora_inicio);
    datosEnviar.hora_final = this.convertirHora12a24(this.materia.hora_final);

    // Validamos que el formato sea correcto y que la final sea mayor a la inicial
    if (!datosEnviar.hora_inicio || !datosEnviar.hora_final || datosEnviar.hora_inicio >= datosEnviar.hora_final) {
        alert("Error de lógica: La hora final debe ser mayor a la inicial y el formato de hora debe ser válido.");
        return;
    }


    this.materiasService.registrarMateria(datosEnviar).subscribe({
      next: (response: any) => {
        alert('Materia registrada con éxito');
        this.router.navigate(["materias-screen"]);
      },
      error: (error: any) => {
        console.log("Error detallado:", error);
        if (error.status === 400) {
           if(error.error.nrc) alert("Error: El NRC ya existe.");
           else alert("Error: Verifique el formato de horas o si la hora final es menor/igual a la inicial.");
        } else {
          alert('Error al registrar la materia.');
        }
      }
    });
  }

  public actualizar() {
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);
    if(Object.keys(this.errors).length > 0) return false;

    const datosEnviar = { ...this.materia };

    datosEnviar.hora_inicio = this.convertirHora12a24(this.materia.hora_inicio);
    datosEnviar.hora_final = this.convertirHora12a24(this.materia.hora_final);

    if (!datosEnviar.hora_inicio || !datosEnviar.hora_final || datosEnviar.hora_inicio >= datosEnviar.hora_final) {
        alert("Error de lógica: La hora final debe ser mayor a la inicial.");
        return;
    }

    const dialogRef = this.dialog.open(EditarMateriasModalComponent, {
      height: '268px', width: '328px',
      data: { rol: 'materia' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isEdit){
        this.materiasService.actualizarMateria(datosEnviar).subscribe({
          next: (response: any) => {
            alert("Materia actualizada exitosamente");
            this.router.navigate(["materias-screen"]);
          },
          error: (error: any) => {
            console.log(error);
            alert("Error al actualizar materia. Verifique el formato de hora.");
          }
        });
      }
    });
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.materia.dias.push(event.source.value);
    } else {
      this.materia.dias.forEach((dia: any, i: number) => {
        if (dia == event.source.value) {
          this.materia.dias.splice(i, 1);
        }
      });
    }
  }

  public revisarSeleccion(nombre: string) {
    if (this.materia.dias) {
      return this.materia.dias.includes(nombre);
    }
    return false;
  }

  public soloNumeros(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[0-9]$/;
    if (!regex.test(char)) { event.preventDefault(); }
  }

    soloLetrasYNumeros(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[a-zA-Z0-9]$/;
    if (!regex.test(char)) {
      event.preventDefault();
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
}
