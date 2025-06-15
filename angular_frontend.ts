// app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Inventory Management System';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

// app.component.html
<div class="app-container">
  <mat-toolbar color="primary" *ngIf="authService.isLoggedIn()">
    <span>{{title}}</span>
    <span class="spacer"></span>
    <span>Welcome, {{authService.getCurrentUser()?.name}}</span>
    <button mat-button (click)="logout()">
      <mat-icon>logout</mat-icon>
      Logout
    </button>
  </mat-toolbar>

  <div class="content">
    <router-outlet></router-outlet>
  </div>
</div>

// app.component.css
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.spacer {
  flex: 1 1 auto;
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

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
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'employee-dashboard', 
    component: EmployeeDashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// models/user.model.ts
export interface User {
  id: number;
  username: string;
  name: string;
  role: 'EMPLOYEE' | 'ADMIN';
}

// models/item.model.ts
export interface Item {
  id?: number;
  name: string;
  description: string;
  quantity: number;
}

// models/request.model.ts
import { User } from './user.model';
import { Item } from './item.model';

export interface Request {
  id?: number;
  user: User;
  item: Item;
  quantity: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestDate: string;
  responseDate?: string;
  adminComments?: string;
}

// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
  }

  setCurrentUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}

// services/item.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:8080/api/items';

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  updateItem(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

// services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:8080/api/requests';

  constructor(private http: HttpClient) {}

  getAllRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl);
  }

  getRequestsByUser(userId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/user/${userId}`);
  }

  createRequest(requestData: any): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, requestData);
  }

  approveRequest(id: number, comments: string): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}/approve`, { comments });
  }

  rejectRequest(id: number, comments: string): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}/reject`, { comments });
  }

  cancelRequest(id: number): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}/cancel`, {});
  }
}

// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

// guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/employee-dashboard']);
      return false;
    }
  }
}

// components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.authService.setCurrentUser(response.user);
            if (response.user.role === 'ADMIN') {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/employee-dashboard']);
            }
          }
        },
        error: (error) => {
          this.snackBar.open('Invalid credentials', 'Close', { duration: 3000 });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}

// components/login/login.component.html
<div class="login-container">
  <mat-card class="login-card">
    <mat-card-header>
      <mat-card-title>Login to Inventory Management</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" required>
          <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" 
                [disabled]="!loginForm.valid || loading" class="full-width">
          <mat-icon *ngIf="loading">refresh</mat-icon>
          {{loading ? 'Logging in...' : 'Login'}}
        </button>
      </form>

      <div class="demo-credentials">
        <h4>Demo Credentials:</h4>
        <p><strong>Admin:</strong> admin / admin123</p>
        <p><strong>Employee:</strong> john / john123 or jane / jane123</p>
      </div>
    </mat-card-content>
  </mat-card>
</div>

// components/login/login.component.css
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 20px;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
}

.demo-credentials {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.demo-credentials h4 {
  margin-top: 0;
  color: #666;
}

.demo-credentials p {
  margin: 5px 0;
  font-size: 14px;
}

// components/employee-dashboard/employee-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { Request } from '../../models/request.model';
import { AddRequestDialogComponent } from '../add-request-dialog/add-request-dialog.component';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  requests: Request[] = [];
  displayedColumns: string[] = ['item', 'quantity', 'reason', 'status', 'requestDate', 'actions'];

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.requestService.getRequestsByUser(user.id).subscribe({
        next: (requests) => {
          this.requests = requests;
        },
        error: (error) => {
          this.snackBar.open('Error loading requests', 'Close', { duration: 3000 });
        }
      });
    }
  }

  openAddRequestDialog() {
    const dialogRef = this.dialog.open(AddRequestDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRequests();
      }
    });
  }

  cancelRequest(request: Request) {
    if (request.id) {
      this.requestService.cancelRequest(request.id).subscribe({
        next: () => {
          this.snackBar.open('Request cancelled successfully', 'Close', { duration: 3000 });
          this.loadRequests();
        },
        error: (error) => {
          this.snackBar.open('Error cancelling request', 'Close', { duration: 3000 });
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
}

// components/employee-dashboard/employee-dashboard.component.html
<div class="dashboard-container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>My Requests</mat-card-title>
      <div class="spacer"></div>
      <button mat-raised-button color="primary" (click)="openAddRequestDialog()">
        <mat-icon>add</mat-icon>
        New Request
      </button>
    </mat-card-header>
    <mat-card-content>
      <table mat-table [dataSource]="requests" class="full-width">
        <ng-container matColumnDef="item">
          <th mat-header-cell *matHeaderCellDef>Item</th>
          <td mat-cell *matCellDef="let request">{{request.item.name}}</td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let request">{{request.quantity}}</td>
        </ng-container>

        <ng-container matColumnDef="reason">
          <th mat-header-cell *matHeaderCellDef>Reason</th>
          <td mat-cell *matCellDef="let request">{{request.reason}}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let request">
            <mat-chip [color]="getStatusColor(request.status)" selected>
              {{request.status}}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="requestDate">
          <th mat-header-cell *matHeaderCellDef>Request Date</th>
          <td mat-cell *matCellDef="let request">
            {{request.requestDate | date:'short'}}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let request">
            <button mat-button color="warn" 
                    *ngIf="request.status === 'PENDING'"
                    (click)="cancelRequest(request)">
              <mat-icon>cancel</mat-icon>
              Cancel
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card-content>
  </mat-card>
</div>

// components/employee-dashboard/employee-dashboard.component.css
.dashboard-container {
  padding: 20px;
}

.spacer {
  flex: 1 1 auto;
}

.full-width {
  width: 100%;
}

mat-card-header {
  display: flex;
  align-items: center;
}

// components/request-management/request-management.component.ts
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor(
    private requestService: RequestService,
    private snackBar: MatSnackBar
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
}

// components/request-management/request-management.component.html
<div class="request-management">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Request Management</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <table mat-table [dataSource]="requests" class="full-width">
        <ng-container matColumnDef="employee">
          <th mat-header-cell *matHeaderCellDef>Employee</th>
          <td mat-cell *matCellDef="let request">{{request.user.name}}</td>
        </ng-container>

        <ng-container matColumnDef="item">
          <th mat-header-cell *matHeaderCellDef>Item</th>
          <td mat-cell *matCellDef="let request">{{request.item.name}}</td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let request">{{request.quantity}}</td>
        </ng-container>

        <ng-container matColumnDef="reason">
          <th mat-header-cell *matHeaderCellDef>Reason</th>
          <td mat-cell *matCellDef="let request">{{request.reason}}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let request">
            <mat-chip [color]="getStatusColor(request.status)" selected>
              {{request.status}}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="requestDate">
          <th mat-header-cell *matHeaderCellDef>Request Date</th>
          <td mat-cell *matCellDef="let request">
            {{request.requestDate | date:'short'}}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let request">
            <button mat-button color="primary" 
                    *ngIf="request.status === 'PENDING'"
                    (click)="approveRequest(request)">
              <mat-icon>check</mat-icon>
              Approve
            </button>
            <button mat-button color="warn" 
                    *ngIf="request.status === 'PENDING'"
                    (click)="rejectRequest(request)">
              <mat-icon>close</mat-icon>
              Reject
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card-content>
  </mat-card>
</div>

// components/request-management/request-management.component.css
.request-management {
  padding: 20px;
}

.full-width {
  width: 100%;
}

// components/add-request-dialog/add-request-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemService } from '../../services/item.service';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-add-request-dialog',
  templateUrl: './add-request-dialog.component.html',
  styleUrls: ['./add-request-dialog.component.css']
})
export class AddRequestDialogComponent implements OnInit {
  requestForm: FormGroup;
  items: Item[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddRequestDialogComponent>,
    private itemService: ItemService,
    private requestService: RequestService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.requestForm = this.fb.group({
      itemId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
      },
      error: (error) => {
        this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      this.loading = true;
      const user = this.authService.getCurrentUser();
      
      if (user) {
        const requestData = {
          userId: user.id,
          itemId: this.requestForm.value.itemId,
          quantity: this.requestForm.value.quantity,
          reason: this.requestForm.value.reason
        };

        this.requestService.createRequest(requestData).subscribe({
          next: () => {
            this.snackBar.open('Request created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Error creating request', 'Close', { duration: 3000 });
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

// components/add-request-dialog/add-request-dialog.component.html
<h2 mat-dialog-title>New Request</h2>
<mat-dialog-content>
  <form [formGroup]="requestForm" class="request-form">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Item</mat-label>
      <mat-select formControlName="itemId" required>
        <mat-option *ngFor="let item of items" [value]="item.id">
          {{item.name}} (Available: {{item.quantity}})
        </mat-option>
      </mat-select>
      <mat-error *ngIf="requestForm.get('itemId')?.hasError('required')">
        Item is required
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Quantity</mat-label>
      <input matInput type="number" formControlName="quantity" min="1" required>
      <mat-error *ngIf="requestForm.get('quantity')?.hasError('required')">
        Quantity is required
      </mat-error>
      <mat-error *ngIf="requestForm.get('quantity')?.hasError('min')">
        Quantity must be at least 1
      </mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Reason</mat-label>
      <textarea matInput formControlName="reason" rows="3" required></textarea>
      <mat-error *ngIf="requestForm.get('reason')?.hasError('required')">
        Reason is required
      </mat-error>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancel</button>
  <button mat-raised-button color="primary" (click)="onSubmit()" 
          [disabled]="!requestForm.valid || loading">
    {{loading ? 'Creating...' : 'Create Request'}}
  </button>
</mat-dialog-actions>

// components/add-request-dialog/add-request-dialog.component.css
.request-form {
  min-width: 400px;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
}

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
        this.itemService.createItem.subscribe({
          next: () => {
            this.snackBar.open('Item created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Error creating item', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
      }
    }
  }

// components/admin-dashboard/admin-dashboard.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  selectedTabIndex = 0;
}

// components/admin-dashboard/admin-dashboard.component.html
<div class="admin-dashboard">
  <mat-tab-group [(selectedIndex)]="selectedTabIndex">
    <mat-tab label="Item Management">
      <app-item-management></app-item-management>
    </mat-tab>
    <mat-tab label="Request Management">
      <app-request-management></app-request-management>
    </mat-tab>
  </mat-tab-group>
</div>

// components/admin-dashboard/admin-dashboard.component.css
.admin-dashboard {
  padding: 20px;
}

// components/item-management/item-management.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { AddItemDialogComponent } from '../add-item-dialog/add-item-dialog.component';

@Component({
  selector: 'app-item-management',
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.css']
})
export class ItemManagementComponent implements OnInit {
  items: Item[] = [];
  displayedColumns: string[] = ['name', 'description', 'quantity', 'actions'];

  constructor(
    private itemService: ItemService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
      },
      error: (error) => {
        this.snackBar.open('Error loading items', 'Close', { duration: 3000 });
      }
    });
  }

  openAddItemDialog() {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }

  editItem(item: Item) {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '500px',
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }

  deleteItem(item: Item) {
    if (confirm('Are you sure you want to delete this item?')) {
      if (item.id) {
        this.itemService.deleteItem(item.id).subscribe({
          next: () => {
            this.snackBar.open('Item deleted successfully', 'Close', { duration: 3000 });
            this.loadItems();
          },
          error: (error) => {
            this.snackBar.open('Error deleting item', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }
}

// components/item-management/item-management.component.html
<div class="item-management">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Item Management</mat-card-title>
      <div class="spacer"></div>
      <button mat-raised-button color="primary" (click)="openAddItemDialog()">
        <mat-icon>add</mat-icon>
        Add Item
      </button>
    </mat-card-header>
    <mat-card-content>
      <table mat-table [dataSource]="items" class="full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let item">{{item.name}}</td>
        </ng-container>

        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let item">{{item.description}}</td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let item">{{item.quantity}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let item">
            <button mat-button color="primary" (click)="editItem(item)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="warn" (click)="deleteItem(item)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card-content>
  </mat-card>
</div>

// components/item-management/item-management.component.css
.item-management {
  padding: 20px;
}

.spacer {
  flex: 1 1 auto;
}

.full-width {
  width: 100%;
}

mat-card-header {
  display: flex;
  align-items: center;
}
