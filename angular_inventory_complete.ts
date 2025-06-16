//interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
}

// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'EMPLOYEE' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on initialization
    const token = this.getToken();
    if (token) {
      // Optionally, decode token or fetch user data to populate userSubject
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        this.userSubject.next(JSON.parse(storedUser));
      }
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
            this.userSubject.next(response.user);
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('auth_user');
    this.userSubject.next(null);
  }
}

// Complete the missing add-item-dialog component
// components/add-item-dialog/add-item-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-add-item-dialog',
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.css']
})
export class AddItemDialogComponent implements OnInit {
  itemForm: FormGroup;
  loading = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Item,
    private itemService: ItemService,
    private snackBar: MatSnackBar
  ) {
    this.isEditing = !!data;
    this.itemForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      quantity: [data?.quantity || 0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.itemForm.valid) {
      this.loading = true;
      const itemData: Item = this.itemForm.value;

      if (this.isEditing && this.data.id) {
        this.itemService.updateItem(this.data.id, itemData).subscribe({
          next: () => {
            this.snackBar.open('Item updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Error updating item', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
      } else {
        this.itemService.createItem(itemData).subscribe({
          next: () => {
            this.snackBar.open('Item created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Error creating item', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}

// components/add-item-dialog/add-item-dialog.component.html
<h2 mat-dialog-title>{{isEditing ? 'Edit Item' : 'Add New Item'}}</h2>
<mat-dialog-content>
  <form [formGroup]="itemForm" class="item-form">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Item Name</mat-label>
      <input matInput formControlName="name" required>
      <mat-error *ngIf="itemForm.get('name')?.hasError('required')">
        Item name is required
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Description</mat-label>
      <textarea matInput formControlName="description" rows="3"></textarea>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Quantity</mat-label>
      <input matInput type="number" formControlName="quantity" min="0" required>
      <mat-error *ngIf="itemForm.get('quantity')?.hasError('required')">
        Quantity is required
      </mat-error>
      <mat-error *ngIf="itemForm.get('quantity')?.hasError('min')">
        Quantity cannot be negative
      </mat-error>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancel</button>
  <button mat-raised-button color="primary" (click)="onSubmit()" 
          [disabled]="!itemForm.valid || loading">
    {{loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Item' : 'Create Item')}}
  </button>
</mat-dialog-actions>

// components/add-item-dialog/add-item-dialog.component.css
.item-form {
  min-width: 400px;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
}

// Enhanced request-management component with better UI
// components/request-management/request-management.component.ts
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RequestService } from '../../services/request.service';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-request-management',
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.css']
})
export class RequestManagementComponent implements OnInit {
  requests: Request[] = [];
  displayedColumns: string[] = ['employee', 'item', 'quantity', 'reason', 'status', 'requestDate', 'actions'];
  filterStatus = 'ALL';

  constructor(
    private requestService: RequestService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getAllRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
      },
      error: (error) => {
        this.snackBar.open('Error loading requests', 'Close', { duration: 3000 });
      }
    });
  }

  get filteredRequests(): Request[] {
    if (this.filterStatus === 'ALL') {
      return this.requests;
    }
    return this.requests.filter(request => request.status === this.filterStatus);
  }

  approveRequest(request: Request) {
    const comments = prompt('Enter approval comments (optional):') || '';
    if (request.id) {
      this.requestService.approveRequest(request.id, comments).subscribe({
        next: () => {
          this.snackBar.open('Request approved successfully', 'Close', { duration: 3000 });
          this.loadRequests();
        },
        error: (error) => {
          this.snackBar.open('Error approving request', 'Close', { duration: 3000 });
        }
      });
    }
  }

  rejectRequest(request: Request) {
    const comments = prompt('Enter rejection reason:');
    if (comments && request.id) {
      this.requestService.rejectRequest(request.id, comments).subscribe({
        next: () => {
          this.snackBar.open('Request rejected successfully', 'Close', { duration: 3000 });
          this.loadRequests();
        },
        error: (error) => {
          this.snackBar.open('Error rejecting request', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'accent';
      case 'APPROVED': return 'primary';
      case 'REJECTED': return 'warn';
      case 'CANCELLED': return '';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'hourglass_empty';
      case 'APPROVED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      case 'CANCELLED': return 'not_interested';
      default: return 'help';
    }
  }
}

// Enhanced request-management HTML template
// components/request-management/request-management.component.html
<div class="request-management">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Request Management</mat-card-title>
      <div class="spacer"></div>
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Status</mat-label>
        <mat-select [(value)]="filterStatus">
          <mat-option value="ALL">All Requests</mat-option>
          <mat-option value="PENDING">Pending</mat-option>
          <mat-option value="APPROVED">Approved</mat-option>
          <mat-option value="REJECTED">Rejected</mat-option>
          <mat-option value="CANCELLED">Cancelled</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-card-header>
    <mat-card-content>
      <div *ngIf="filteredRequests.length === 0" class="no-requests">
        <mat-icon>inbox</mat-icon>
        <p>No requests found</p>
      </div>
      
      <table mat-table [dataSource]="filteredRequests" class="full-width" *ngIf="filteredRequests.length > 0">
        <ng-container matColumnDef="employee">
          <th mat-header-cell *matHeaderCellDef>Employee</th>
          <td mat-cell *matCellDef="let request">
            <div class="employee-info">
              <mat-icon class="user-icon">person</mat-icon>
              <span>{{request.user.name}}</span>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="item">
          <th mat-header-cell *matHeaderCellDef>Item</th>
          <td mat-cell *matCellDef="let request">
            <div class="item-info">
              <strong>{{request.item.name}}</strong>
              <small>{{request.item.description}}</small>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let request">
            <mat-chip class="quantity-chip">{{request.quantity}}</mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="reason">
          <th mat-header-cell *matHeaderCellDef>Reason</th>
          <td mat-cell *matCellDef="let request">
            <span class="reason-text">{{request.reason}}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let request">
            <mat-chip [color]="getStatusColor(request.status)" selected class="status-chip">
              <mat-icon>{{getStatusIcon(request.status)}}</mat-icon>
              {{request.status}}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="requestDate">
          <th mat-header-cell *matHeaderCellDef>Request Date</th>
          <td mat-cell *matCellDef="let request">
            <div class="date-info">
              <span>{{request.requestDate | date:'MMM d, y'}}</span>
              <small>{{request.requestDate | date:'h:mm a'}}</small>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let request">
            <div class="action-buttons">
              <button mat-mini-fab color="primary" 
                      *ngIf="request.status === 'PENDING'"
                      (click)="approveRequest(request)"
                      matTooltip="Approve Request">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-mini-fab color="warn" 
                      *ngIf="request.status === 'PENDING'"
                      (click)="rejectRequest(request)"
                      matTooltip="Reject Request">
                <mat-icon>close</mat-icon>
              </button>
              <span *ngIf="request.status !== 'PENDING'" class="completed-badge">
                {{request.status}}
              </span>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
            [class.pending-row]="row.status === 'PENDING'"
            [class.approved-row]="row.status === 'APPROVED'"
            [class.rejected-row]="row.status === 'REJECTED'"></tr>
      </table>
    </mat-card-content>
  </mat-card>
</div>

// Enhanced request-management CSS
// components/request-management/request-management.component.css
.request-management {
  padding: 20px;
}

.spacer {
  flex: 1 1 auto;
}

.full-width {
  width: 100%;
}

.filter-field {
  width: 200px;
  margin-left: 20px;
}

mat-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.no-requests {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-requests mat-icon {
  font-size: 48px;
  height: 48px;
  width: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  color: #666;
  font-size: 18px;
  height: 18px;
  width: 18px;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-info small {
  color: #666;
  font-size: 12px;
}

.quantity-chip {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
}

.reason-text {
  max-width: 200px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-chip mat-icon {
  font-size: 16px;
  height: 16px;
  width: 16px;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-info small {
  color: #666;
  font-size: 11px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.completed-badge {
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.pending-row {
  background-color: #fff3e0;
}

.approved-row {
  background-color: #e8f5e8;
}

.rejected-row {
  background-color: #ffebee;
}

mat-row:hover {
  background-color: #f5f5f5;
}

// Add missing Angular Material modules to app.module.ts
// Update the imports in app.module.ts to include missing modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ItemManagementComponent } from './components/item-management/item-management.component';
import { RequestManagementComponent } from './components/request-management/request-management.component';
import { AddRequestDialogComponent } from './components/add-request-dialog/add-request-dialog.component';
import { AddItemDialogComponent } from './components/add-item-dialog/add-item-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EmployeeDashboardComponent,
    AdminDashboardComponent,
    ItemManagementComponent,
    RequestManagementComponent,
    AddRequestDialogComponent,
    AddItemDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Enhanced global styles
// styles.css
@import '@angular/material/theming';

html, body { 
  height: 100%; 
  margin: 0; 
  font-family: Roboto, "Helvetica Neue", sans-serif; 
}

.mat-mdc-dialog-container {
  --mdc-dialog-container-color: white;
}

.mat-mdc-snack-bar-container {
  --mdc-snackbar-container-color: #323232;
  --mdc-snackbar-supporting-text-color: white;
}

// Custom theme colors
.mat-primary {
  background-color: #1976d2 !important;
  color: white !important;
}

.mat-accent {
  background-color: #ff9800 !important;
  color: white !important;
}

.mat-warn {
  background-color: #f44336 !important;
  color: white !important;
}

// Table enhancements
.mat-mdc-table {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.mat-mdc-header-row {
  background-color: #f5f5f5;
}

.mat-mdc-row:hover {
  background-color: #f9f9f9;
}

// Card enhancements
.mat-mdc-card {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
}

// Button enhancements
.mat-mdc-raised-button {
  border-radius: 4px;
  font-weight: 500;
}

.mat-mdc-fab.mat-primary {
  background-color: #1976d2;
}

.mat-mdc-fab.mat-warn {
  background-color: #f44336;
}

// Package.json dependencies
{
  "name": "inventory-management-frontend",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "dependencies": {
    "@angular/animations": "^16.0.0",
    "@angular/cdk": "^16.0.0",
    "@angular/common": "^16.0.0",
    "@angular/compiler": "^16.0.0",
    "@angular/core": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "@angular/material": "^16.0.0",
    "@angular/platform-browser": "^16.0.0",
    "@angular/platform-browser-dynamic": "^16.0.0",
    "@angular/router": "^16.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.13.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^16.0.0",
    "@angular/cli": "~16.0.0",
    "@angular/compiler-cli": "^16.0.0",
    "@types/jasmine": "~4.3.0",
    "@types/node": "^18.7.0",
    "jasmine-core": "~4.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.0.2"
  }
}

// Setup Instructions
/*
1. Install Angular CLI globally:
   npm install -g @angular/cli

2. Create new Angular project:
   ng new inventory-management-frontend
   cd inventory-management-frontend

3. Install dependencies:
   npm install @angular/material @angular/cdk @angular/animations

4. Replace the generated files with the code above

5. Start the development server:
   ng serve

6. Open browser to http://localhost:4200

The application will be ready to use with the following features:
- Employee login and dashboard
- Admin login and dashboard  
- Item management (CRUD operations)
- Request management (create, approve, reject, cancel)
- Real-time status updates
- Responsive Material Design UI
*/
