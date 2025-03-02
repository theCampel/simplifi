# Crypto Harmony Dashboard Frontend

This is the frontend application for the Crypto Harmony Dashboard, built with React, TypeScript, and shadcn/ui components.

## Features

- Real-time cryptocurrency price tracking with interactive charts
- Portfolio management interface
- Responsive design for desktop and mobile
- Dark/light mode support
- Cryptocurrency news feed

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query
- **Routing**: React Router
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

This will create a `dist` directory with the compiled assets.

## Environment Variables

Create a `.env` file in the root of the frontend directory with the following variables:

```
VITE_API_URL=http://localhost:8000 # Backend API URL
```

## Project Structure

```
frontend/
├── public/         # Static assets
├── src/
│   ├── components/ # Reusable UI components
│   ├── hooks/      # Custom React hooks
│   ├── lib/        # Utility functions and configurations
│   ├── pages/      # Page components
│   ├── services/   # API service functions
│   ├── App.tsx     # Main application component
│   └── main.tsx    # Application entry point
├── index.html      # HTML entry point
└── vite.config.ts  # Vite configuration
```

## Contributing

1. Make sure your code follows the project's coding standards
2. Run `npm run lint` to check for linting errors
3. Test your changes thoroughly before submitting a pull request 