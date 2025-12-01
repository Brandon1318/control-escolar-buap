import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss']
})
export class NavbarUserComponent implements OnInit {

  public expandedMenu: string | null = null;
  public userInitial: string = '';
  public isMobileView: boolean = window.innerWidth <= 992;
  public showUserMenu: boolean = false;
  public mobileOpen: boolean = false;
  public userRole: string = '';
  public showRegistroMenu: boolean = false;

  // Variables para tema oscuro/claro
  paletteMode: 'light' | 'dark' = 'light';
  colorPalettes = {
    light: {
      '--background-main': '#f4f7fb',
      '--sidebar-bg': '#23395d',
      '--navbar-bg': '#fff',
      '--text-main': '#222',
      '--table-bg': '#fff',
      '--table-header-bg': '#cfe2ff',
    },
    dark: {
      '--background-main': '#181a1b',
      '--sidebar-bg': '#1a2636',
      '--navbar-bg': '#222',
      '--text-main': '#e4ecfa',
      '--table-bg': '#222',
      '--table-header-bg': '#30507a',
    }
  };

  constructor(private router: Router, private facadeService: FacadeService) {
    // Obtener iniciales
    const name = this.facadeService.getUserCompleteName();
    if (name && name.length > 0) {
      this.userInitial = name.trim()[0].toUpperCase();
    } else {
      this.userInitial = '?';
    }

    // Obtener rol
    this.userRole = this.facadeService.getUserGroup();

    // Listener para resize
    window.addEventListener('resize', () => {
      this.isMobileView = window.innerWidth <= 992;
      if (!this.isMobileView) {
        this.mobileOpen = false;
      }
    });

    // Iniciar paleta de colores
    this.paletteMode = 'light';
    const palette = this.colorPalettes['light'];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key]);
    });
  }

  ngOnInit(): void {
    // Actualizar rol al iniciar por si acaso
    this.userRole = this.facadeService.getUserGroup();
    console.log("Rol en navbar:", this.userRole);
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobileView = window.innerWidth <= 992;
    if (!this.isMobileView) {
      this.mobileOpen = false;
    }
  }

  togglePalette() {
    this.paletteMode = this.paletteMode === 'light' ? 'dark' : 'light';
    const palette = this.colorPalettes[this.paletteMode];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key]);
    });
  }

  toggleSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar() {
    this.mobileOpen = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  editUser() {
    const userId = this.facadeService.getUserId();
    const userRole = this.facadeService.getUserGroup();
    this.router.navigate([`/registro-usuarios/${userRole}/${userId}`]);
    this.showUserMenu = false;
  }

  toggleRegistroMenu() {
    this.showRegistroMenu = !this.showRegistroMenu;
  }

  logout() {
    this.facadeService.logout().subscribe(
      () => {
        this.facadeService.destroyUser();
        this.router.navigate(['/login']);
        this.closeSidebar();
      },
      () => {
        this.facadeService.destroyUser();
        this.router.navigate(['/login']);
        this.closeSidebar();
      }
    );
  }

  // --- HELPERS DE ROLES
  isAdmin(): boolean {
    return this.userRole.toLowerCase() === 'administrador';
  }

  isTeacher(): boolean {
    return this.userRole.toLowerCase() === 'maestro';
  }

  isStudent(): boolean {
    return this.userRole.toLowerCase() === 'alumno';
  }

  // Permisos Visibilidad
  canSeeRegisterItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
  canSeeAdminItems(): boolean {
    return this.isAdmin(); }

  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isTeacher() || this.isStudent();
  }

  // Permisos Materias
  canSeeMateriasMenu(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
  canSeeMateriaRegister(): boolean {
    return this.isAdmin();
  }
  canSeeMateriaList(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
}

