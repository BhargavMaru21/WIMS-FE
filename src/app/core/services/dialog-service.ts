import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { DialogConfig } from '../../shared/components/dialog/dialog';


@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly matDialog = inject(MatDialog);

  open<T>(
    config: DialogConfig,
    contentComponent: ComponentType<T>,
    data?: Record<string, unknown>,
    width = '480px',
  ): MatDialogRef<T> {
    return this.matDialog.open(contentComponent, {
      width,
      maxWidth: '95vw',
      disableClose: false,
      data: { config, ...(data ?? {}) },
      panelClass: 'wims-dialog-panel',
    });
  }
}