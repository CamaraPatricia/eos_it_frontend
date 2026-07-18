import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/User';
import { UserService } from '../../../services/user-service';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  user: User | null = null;

  ngOnInit(): void {
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  }
}
