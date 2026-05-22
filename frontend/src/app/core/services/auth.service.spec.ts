import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should perform login', () => {
    service.login('admin@aivacol.com', 'aivacol@123').subscribe((response) => {
      expect(response.accessToken).toBe('token');
    });

    const request = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({ accessToken: 'token', refreshToken: 'refresh', user: { id: 1, email: 'a' } });
  });
});
