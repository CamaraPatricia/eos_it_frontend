import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { Search } from './components/search/search';
import { MyTasks } from './components/my-tasks/my-tasks';
import { NewTask } from './components/new-task/new-task';
import { LoginComponent } from './components/login-component/login-component';
import { LoggedInGuard } from '../services/logged-in-guard';
import { GuestGuard } from '../services/guest-guard';
import { UserStatistics } from './components/user-statistics/user-statistics';
import { AdminGuard } from '../services/admin-guard-guard';

export const routes: Routes = [
    {path: 'homepage', component: Homepage, canActivate: [LoggedInGuard]},
    {path: 'my-tasks', component: MyTasks, canActivate: [LoggedInGuard]},
    {path: 'search', component: Search, canActivate: [LoggedInGuard]},
    {path: 'new-task', component: NewTask, canActivate: [LoggedInGuard]},
    {path: 'new-task/:id', component: NewTask, canActivate: [LoggedInGuard]},
    {path: 'login', component: LoginComponent, canActivate: [GuestGuard]},
    {path: 'statistics', component: UserStatistics, canActivate: [AdminGuard]},
];
