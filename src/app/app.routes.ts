import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { Search } from './components/search/search';
import { MyTasks } from './components/my-tasks/my-tasks';
import { NewTask } from './components/new-task/new-task';

export const routes: Routes = [
    {path: 'homepage', component: Homepage},
    {path: 'my-tasks', component: MyTasks},
    {path: 'search', component: Search},
    {path: 'new-task', component: NewTask},
    {path: 'new-task/:id', component: NewTask},
];
