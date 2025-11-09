// src/app/components/confirm-dialog/confirm-dialog.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() message: string = '';
  @Output() confirm = new EventEmitter<boolean>();
  
  onConfirm(): void {
    this.confirm.emit(true);
  }
  
  onCancel(): void {
    this.confirm.emit(false);
  }
}

