export enum UserRole {
  User = 1,
  Creator = 2,
  Admin = 3
}

export enum MediaType {
  Music = 1,
  Video = 2,
  Podcast = 3,
  AudioBook = 4
}

export enum Genre {
  Pop = 1,
  Rock = 2,
  HipHop = 3,
  Electronic = 4,
  Classical = 5,
  Jazz = 6,
  Country = 7,
  RnB = 8,
  Reggae = 9,
  Folk = 10,
  Alternative = 11,
  Indie = 12,
  Other = 99
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  role: UserRole;
  subscriptionPlanId?: number;
}

export interface Media {
  mediaId: number;
  title: string;
  mediaType: MediaType;
  url: string;
  durationInMinutes: number;
  genre?: Genre;
  releaseDate: string;
  composer?: string;
  album?: string;
  description?: string;
  creatorId?: number;
  thumbnail?: string;
  filePath?: string;
  language?: string;
}

export interface Subscription {
  id: number;
  userId: number;
  username: string;
  planType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoId: string;
}

export interface Playlist {
  playlistId: number;
  name: string;
}

export interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}