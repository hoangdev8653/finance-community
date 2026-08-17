export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  roles: string[];
  status: AccountStatus;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
    username: string;
    status: AccountStatus;
    provider?: string;
  };
}

export interface UserMeResponse {
  id: string;
  email: string;
  status: AccountStatus;
  roles: string[];
  profile?: {
    id?: string;
    userId?: string;
    username?: string;
    displayName?: string;
    avatarMediaId?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  idToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}
