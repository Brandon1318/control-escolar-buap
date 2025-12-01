import { Component, OnInit } from '@angular/core';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {

  public rol: string = "";

  constructor(
    private facadeService: FacadeService
  ) { }

  //esta funcion devuelve el rol del usuario
  ngOnInit(): void {
    this.rol = this.facadeService.getUserGroup();
    console.log("Rol: ", this.rol);
  }

}
