import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number;
}

class AuthService {
  // Retrieve token from localStorage
  private getToken = (): string | null => localStorage.getItem('id_token');

  // Decode token and return user profile
  getProfile = () => {
    const token = this.getToken();
    return token ? jwtDecode<UserToken>(token) : null;
  };

  // Check if the user is logged in
  loggedIn = (): boolean => {
    const token = this.getToken();
    return Boolean(token && !this.isTokenExpired(token));
  };

  // Check if token is expired
  private isTokenExpired = (token: string): boolean => {
    try {
      const { exp } = jwtDecode<UserToken>(token);
      return exp < Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // Save token to localStorage and redirect
  login = (idToken: string): void => {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  };

  // Clear token and reset app state
  logout = (): void => {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  };
}

export default new AuthService();
