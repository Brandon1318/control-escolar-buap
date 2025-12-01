import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  // esquema de materias
  public esquemaMateria(){
    return {
      'nrc': '',
      'nombre': '',
      'seccion': '',
      'dias': [],
      'hora_inicio': '',
      'hora_final': '',
      'salon': '',
      'programa_educativo': '',
      'profesor': '',
      'creditos': ''
    }
  }

  // 2. Validación para el formulario
  public validarMateria(data: any, editar: boolean){
    console.log("Validando materia... ", data);
    let error: any = [];

    // Validar NRC
    if(!this.validatorService.required(data["nrc"])){
      error["nrc"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["nrc"])){
      error["nrc"] = "El NRC debe ser numérico";
    } else if(!this.validatorService.min(data["nrc"], 5)){
      error["nrc"] = "El NRC debe tener al menos 5 dígitos";
    }

    // Validar Nombre
    if(!this.validatorService.required(data["nombre"])){
      error["nombre"] = this.errorService.required;
    }

    // Validar Sección
    if(!this.validatorService.required(data["seccion"])){
      error["seccion"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["seccion"])){
      error["seccion"] = "La sección debe ser numérica";
    } else if(!this.validatorService.max(data["seccion"], 3)){
      error["seccion"] = "Máximo 3 dígitos";
    }

    // Validar Días
    if(data["dias"].length === 0){
      error["dias"] = "Debes seleccionar al menos un día";
    }

    // Validar Horarios
    if(!this.validatorService.required(data["hora_inicio"])){
      error["hora_inicio"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["hora_final"])){
      error["hora_final"] = this.errorService.required;
    }

    // Validar Salón
    if(!this.validatorService.required(data["salon"])){
      error["salon"] = this.errorService.required;
    }

    // Validar Programa Educativo
    if(!this.validatorService.required(data["programa_educativo"])){
      error["programa_educativo"] = this.errorService.required;
    }

    // Validar Profesor
    if(!this.validatorService.required(data["profesor"])){
      error["profesor"] = this.errorService.required;
    }

    // Validar Créditos
    if(!this.validatorService.required(data["creditos"])){
      error["creditos"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["creditos"])){
      error["creditos"] = "Solo números";
    }

    // Return arreglo de errores
    return error;
  }

  // Registrar nueva materia
  public registrarMateria(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/materia/`, data, { headers });
  }

  // Obtener lista de materias
  public obtenerListaMaterias(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  // Obtener materia por ID para editar
  public obtenerMateriaPorID(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/materia/?id=${idMateria}`, { headers });
  }

  // Actualizar materia
  public actualizarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/materia/`, data, { headers });
  }

  // Eliminar materia
  public eliminarMateria(idMateria: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/materia/?id=${idMateria}`, { headers });
  }

  public obtenerListaMaestros(): Observable<any>{
  const token = this.facadeService.getSessionToken();
     let headers: HttpHeaders;
     if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers });
  }
}
