import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

//definimos las petición HTTP de la API, esto se manda como un json
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

//decorador del servicio
@Injectable({
  providedIn: 'root'
})

//inyecciones de servicios
export class AlumnosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  //plantilla de datos del alumno
  public esquemaAlumno(){
    return {
      'rol':'',
      'matricula': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'curp': '',
      'rfc': '',
      'edad': '',
      'telefono': '',
      'ocupacion': ''
    }
  }

  //validaciones del formulario de registro de alumno
  public validarAlumno(data: any, editar: boolean){
    console.log("Validando alumno... ", data);
    let error: any = {};

    if(!this.validatorService.required(data["matricula"])){
      error["matricula"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["first_name"])){
      error["first_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["last_name"])){
      error["last_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    }else if(!this.validatorService.max(data["email"], 40)){
      error["email"] = this.errorService.max(40);
    }else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if(!editar){
      if(!this.validatorService.required(data["password"])){
        error["password"] = this.errorService.required;
      }

      if(!this.validatorService.required(data["confirmar_password"])){
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if(!this.validatorService.required(data["fecha_nacimiento"])){
      error["fecha_nacimiento"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["curp"])){
      error["curp"] = this.errorService.required;
    }else if(!this.validatorService.min(data["curp"], 18)){
      error["curp"] = this.errorService.min(18);
    }else if(!this.validatorService.max(data["curp"], 18)){
      error["curp"] = this.errorService.max(18);
    }

    if(!this.validatorService.required(data["rfc"])){
      error["rfc"] = this.errorService.required;
    }else if(!this.validatorService.min(data["rfc"], 12)){
      error["rfc"] = this.errorService.min(12);
    }else if(!this.validatorService.max(data["rfc"], 13)){
      error["rfc"] = this.errorService.max(13);
    }

    if(!this.validatorService.required(data["edad"])){
      error["edad"] = this.errorService.required;
    }else if(!this.validatorService.numeric(data["edad"])){
       error["edad"] = "La edad debe ser numérica";
    }

    if(!this.validatorService.required(data["telefono"])){
      error["telefono"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["ocupacion"])){
      error["ocupacion"] = this.errorService.required;
    }

    //Return arreglo
    return error;
  }

  //funcion para registrar un nuevo alumno
  public registrarAlumno (data: any): Observable <any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    //aqui obtenemos el token, si existe agregamos el bearer token
    if (token) {
      headers = new HttpHeaders ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer' + token});
    //sino existe, no se agrega y se quedan los headers normales
    }else{
      headers = new HttpHeaders ({ 'Content-Type': 'application/json'});
    }

    //URLs que apuntan a las endpoints
    return this.http.post<any>(`${environment.url_api}/alumno/`,data, httpOptions);
  }

  public obtenerListaAlumnos(): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    // Asumimos que este es el endpoint correcto para la lista
    return this.http.get<any>(`${environment.url_api}/lista-alumnos/`, { headers });
  }

  // Petición para obtener un alumno por su ID
  public obtenerAlumnoPorID(idAlumno: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.get<any>(`${environment.url_api}/alumno/?id=${idAlumno}`, { headers });
  }

 //Petición para actualizar un alumno
  public actualizarAlumno(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }

    return this.http.put<any>(`${environment.url_api}/alumno/`, data, { headers });
  }

  //Servicio para eliminar un alumno
  public eliminarAlumno(idAlumno: number): Observable<any>{
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/alumno/?id=${idAlumno}`, { headers });
  }
}
