import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth-service';
import { ToastService } from '../../core/services/toast-service';
import { UserProfileResponse } from '../../core/models/auth-models';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog';
import { ChangePasswordDialogComponent } from './components/change-password-dialog/change-password-dialog';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  readonly profile = signal<UserProfileResponse | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.authService
      .getProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.profile.set(res.data);
          }
        },
      });
  }

  get initials(): string {
    return (this.profile()?.fullName ?? '')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get roleBadgeClass(): string {
    switch (this.profile()?.role) {
      case 'Admin': return 'badge-purple';
      case 'WarehouseManager': return 'badge-blue';
      case 'StockKeeper': return 'badge-teal';
      default: return 'badge-gray';
    }
  }

  get roleLabel(): string {
    switch (this.profile()?.role) {
      case 'WarehouseManager': return 'Warehouse Manager';
      case 'StockKeeper': return 'Stock Keeper';
      default: return this.profile()?.role ?? '';
    }
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatDateTime(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  openEditProfile(): void {
    const p = this.profile();
    if (!p) return;

    const ref = this.dialog.open(EditProfileDialogComponent, {
      width: '460px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'wims-dialog-panel',
      data: {
        config: { title: 'Edit Profile', submitLabel: 'Save Changes' },
        profile: p,
      },
    });

    ref.afterClosed().subscribe((updated: UserProfileResponse | false) => {
      if (updated) this.profile.set(updated);
    });
  }

  openChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '460px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'wims-dialog-panel',
      data: {
        config: { title: 'Change Password', submitLabel: 'Change Password' },
      },
    });
  }

  onSignOut(): void {
    this.authService.logoutAndRedirect();
  }
}