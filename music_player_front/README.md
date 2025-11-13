# Music Streaming Frontend

A React TypeScript frontend for the music streaming application.

## Features

- **Authentication**: Login and registration with role-based access
- **Media Browsing**: View all available media with playback for music
- **Content Upload**: Creators can upload music, videos, podcasts, and audiobooks
- **My Uploads**: Creators can manage their uploaded content
- **Role-based UI**: Different features available based on user role (User, Creator, Admin)

## User Roles

- **User**: Can browse and play media
- **Creator**: Can upload, manage, and delete their own media
- **Admin**: Full access to all features

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Make sure the backend API is running on `https://localhost:7297`

## API Integration

The frontend connects to the ASP.NET Core backend API with the following endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/media` - Get all media
- `POST /api/media/upload` - Upload new media (Creators only)
- `GET /api/media/myuploads` - Get user's uploads (Creators only)
- `DELETE /api/media/{id}` - Delete media (Creators/Admins only)

## Components

- **Login/Register**: Authentication forms
- **MediaList**: Browse and play available media
- **MediaUpload**: Upload form for creators
- **MyUploads**: Manage uploaded content
- **Navigation**: Role-based navigation menu

## Technologies

- React 19
- TypeScript
- Axios for API calls
- Vite for build tooling