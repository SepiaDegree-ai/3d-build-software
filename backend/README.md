# 3D Build Software Backend

This is the backend server for the 3D Build Software application. It provides APIs for managing materials, projects, and 3D model uploads.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Speckle account and API token

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/3d-build-software
   SPECKLE_TOKEN=your_speckle_token_here
   SPECKLE_SERVER_URL=https://speckle.xyz
   MAX_FILE_SIZE=52428800
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Materials

- `GET /api/materials` - Get all materials
- `GET /api/materials/:id` - Get a specific material
- `POST /api/materials` - Create a new material
- `PUT /api/materials/:id` - Update a material
- `DELETE /api/materials/:id` - Delete a material

### Projects

- `GET /api/projects` - Get all projects for the current user
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Models

- `POST /api/models/upload` - Upload and convert a Revit model
- `GET /api/models/:id` - Get a specific model

## File Upload

The server accepts Revit files (.rvt, .rfa) up to 50MB in size. Files are automatically converted to GLB format using Speckle's conversion service.

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "message": "Error description"
}
```

## Development

The server uses nodemon for development, which automatically restarts when files change.

## Production

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use `npm start` instead of `npm run dev`
3. Configure your MongoDB connection string for production
4. Set up proper CORS settings for your frontend domain 