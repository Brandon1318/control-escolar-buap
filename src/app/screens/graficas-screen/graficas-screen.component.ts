import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  // Variables
  public total_user: any = {};

  //histograma
  lineChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Materias por Programa',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        fill: false,
        tension: 0.1
      }
    ]
  };
  lineChartOption = {
    responsive: true // Cambiado a true para mejor ajuste
  };
  lineChartPlugins = [ DatalabelsPlugin ];


  //barras
  barChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Conteo de Materias',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  };
  barChartOption = {
    responsive: true
  };
  barChartPlugins = [ DatalabelsPlugin ];


  // pastel
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [], // Se llenará dinámicamente, dependiendo los usuarios o materias
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  };
  pieChartOption = {
    responsive: true
  };
  pieChartPlugins = [ DatalabelsPlugin ];


  // dona
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [], // Se llenará dinámicamente, dependiendo los usuarios o materias
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  };
  doughnutChartOption = {
    responsive: true
  };
  doughnutChartPlugins = [ DatalabelsPlugin ];


  constructor(
    private administradoresServices: AdministradoresService,
    private materiasService: MateriasService // Inyectamos servicios necesarios
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerDatosMaterias();
  }

  // cargar datos de usuarios en pastel y dona
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Extraemos los datos de admin, alumnos y maestros del JSON

        const admins = response.admins || 0;
        const maestros = response.maestros || 0;
        const alumnos = response.alumnos || 0;

        // Actualiza Gráfica de Pastel
        this.pieChartData.datasets[0].data = [admins, maestros, alumnos];
        // Fuerza actualización del objeto para que Angular detecte el cambio
        this.pieChartData = { ...this.pieChartData };

        // Actualiza Gráfica de Dona
        this.doughnutChartData.datasets[0].data = [admins, maestros, alumnos];
        this.doughnutChartData = { ...this.doughnutChartData };

      }, (error)=>{
        console.error("Error al obtener total de usuarios ", error);
      }
    );
  }

  // cargar datos de usuarios para barras y lineas
  public obtenerDatosMaterias(){
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        console.log("Materias para gráficas:", response);

        //hace el conteo de materias por programa Educativo
        const ingenieria = response.filter((m: any) => m.programa_educativo === 'Ingeniería en Ciencias de la Computación').length;
        const licenciatura = response.filter((m: any) => m.programa_educativo === 'Licenciatura en Ciencias de la Computación').length;
        const iti = response.filter((m: any) => m.programa_educativo === 'Ingeniería en Tecnologías de la Información').length;

        // Etiquetas para las gráficas
        const labels = ['Ingeniería', 'Licenciatura', 'ITI'];
        const data = [ingenieria, licenciatura, iti];

        // Actualiza Gráfica de Barras
        this.barChartData.labels = labels;
        this.barChartData.datasets[0].data = data;
        this.barChartData = { ...this.barChartData };

        // Actualizar Gráfica de Líneas
        this.lineChartData.labels = labels;
        this.lineChartData.datasets[0].data = data;
        this.lineChartData = { ...this.lineChartData };

      }, (error) => {
        console.error("Error al obtener materias para gráficas", error);
      }
    );
  }

}
