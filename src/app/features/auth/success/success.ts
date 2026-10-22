import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-success',
  imports: [],
  templateUrl: './success.html',
  styleUrl: './success.scss',
})
export class Success {
  private readonly authService = inject(AuthService);


  logout(): void {
    this.authService.logoutAndRedirect();
  }
}
