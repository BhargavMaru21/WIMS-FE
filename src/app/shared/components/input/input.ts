import {
  Component,
  Input,
  Output,
  EventEmitter,
  Optional,
  Self,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  DoCheck,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription } from 'rxjs';

type InputValue = string | number | null;
type MatInputWithStateChanges = MatInput & { stateChanges?: Subject<void> };

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class InputComponent implements ControlValueAccessor, AfterViewInit, OnDestroy, DoCheck {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() appearance: 'outline' | 'fill' = 'outline';
  @Input() subscriptSizing: 'fixed' | 'dynamic' = 'dynamic';
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'search' = 'text';
  @Input() readonly = false;
  @Input() autocomplete = 'off';
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() pattern?: string;

  // static prefix
  @Input() prefixIcon?: string;
  @Input() prefixIconPath?: string;

  // clickable suffix button
  @Input() icon?: string;
  @Input() iconPath?: string;
  @Input() iconTooltip?: string;

  @Input() customErrorMessage?: string;

  //Events
  @Output() iconClick = new EventEmitter<void>();

  @ViewChild(MatInput) matInput!: MatInput;

  // Internal state 
  value: InputValue = '';
  disabled = false;
  showPassword = false;

  private subscription = new Subscription();
  private wasTouched = false;

  onChange: (val: InputValue) => void = () => { };
  onTouched = () => { };

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngDoCheck(): void {
    const isTouched = !!this.ngControl?.control?.touched;
    if (isTouched !== this.wasTouched) {
      this.wasTouched = isTouched;
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }

  ngAfterViewInit() {
    if (this.ngControl?.control && this.matInput) {
      this.subscription.add(
        this.ngControl.control.statusChanges.subscribe(() => {
          (this.matInput as MatInputWithStateChanges).stateChanges?.next();
        }),
      );

      Object.defineProperty(this.matInput, 'errorState', {
        get: () => {
          const control = this.ngControl?.control;
          const isInteracted = !!(control && (control.touched));
          const hasControlErrors = !!(control && control.invalid && isInteracted);
          const hasCustomError = !!(this.customErrorMessage && isInteracted);
          return hasControlErrors || hasCustomError;
        },
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ControlValueAccessor

  writeValue(value: InputValue): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: InputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Handlers

  handleInputEvent(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.handleInput(target?.value ?? '');
  }

  handleInput(value: string): void {
    let processedValue: InputValue = value;

    if (this.type === 'number' && value !== '' && value !== null) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        if (this.step !== undefined) {
          const decimals = (this.step.toString().split('.')[1] ?? '').length;
          processedValue = parseFloat(num.toFixed(decimals));
        } else {
          processedValue = num;
        }
      }
    }

    this.value = processedValue;
    this.onChange(processedValue);

    if (this.ngControl?.control) {
      this.ngControl.control.markAsDirty();
      this.ngControl.control.updateValueAndValidity();
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }

  markTouched(): void {
    if (this.ngControl?.control) {
      if (typeof this.value === 'string') {
        const trimmed = this.value.trim();
        if (trimmed !== this.value) {
          this.value = trimmed;
          this.onChange(trimmed);
          this.ngControl.control.setValue(trimmed, { emitEvent: false });
        }
      }
      this.ngControl.control.markAsTouched();
      (this.matInput as MatInputWithStateChanges)?.stateChanges?.next();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  handleIconClick(): void {
    this.iconClick.emit();
  }


  // The actual input type to bind — handles password show/hide toggle 
  get effectiveType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  // Whether the suffix area should render at all
  get hasSuffix(): boolean {
    return this.type === 'password' || !!(this.icon || this.iconPath);
  }

  get errorMessage(): string {
    const control = this.ngControl?.control;
    if (!control) return '';
    //after focus loss error will be shown
    if (!control.touched) return '';

    if (this.customErrorMessage) return this.customErrorMessage;

    if (!control.errors) return '';
    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['whitespace']) return 'This field cannot be empty or whitespace only';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength'])
      return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength'])
      return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }
}