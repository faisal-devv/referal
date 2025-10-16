# Referus.co Frontend

This is the React frontend for the Referus.co platform - a comprehensive referral management system.

## Features

- **Modern React 18** with hooks and functional components
- **Tailwind CSS** for responsive, utility-first styling
- **React Router** for client-side navigation
- **React Hook Form** for form management and validation
- **Axios** for API communication
- **Socket.io** for real-time chat functionality
- **React Hot Toast** for notifications
- **Lucide React** for consistent iconography

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open [http://localhost:3000](http://localhost:3000) to view it in the browser.**

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Common/         # Generic components (Button, Input, Modal, etc.)
│   ├── Layout/         # Layout components (Header, Footer, Layout)
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Leads/          # Lead management components
│   ├── Wallet/         # Wallet and withdrawal components
│   ├── Chat/           # Chat and messaging components
│   └── Admin/          # Admin panel components
├── pages/              # Page components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── utils/              # Utility functions and helpers
├── styles/             # Custom CSS and animations
└── App.js              # Main application component
```

## Key Components

### Authentication
- `LoginForm` - User login with email/password
- `RegisterForm` - User registration
- `AuthModal` - Modal wrapper for auth forms
- `ProtectedRoute` - Route protection for authenticated users

### Dashboard
- `StatsCard` - Display key metrics
- `QuickActions` - Common action shortcuts
- `WalletSummary` - Multi-currency wallet overview

### Lead Management
- `LeadForm` - Submit new leads with validation
- `LeadCard` - Display lead information
- `LeadFilters` - Search and filter leads
- `LeadStatusModal` - Admin lead status updates

### Wallet System
- `WithdrawalForm` - Request withdrawals
- `WithdrawalCard` - Display withdrawal information
- Multi-currency support (USD, AED, EUR, SAR)

### Chat System
- `ConversationList` - List of chat conversations
- `MessageList` - Display chat messages
- `MessageInput` - Send new messages
- Real-time updates with Socket.io

### Admin Panel
- `UserManagement` - Manage user accounts
- `LeadStatusModal` - Update lead statuses
- `WithdrawalModal` - Review withdrawal requests

## Styling

The project uses **Tailwind CSS** with custom components and utilities:

- **Utility-first approach** for rapid development
- **Custom component classes** in `styles/components.css`
- **Animation utilities** in `styles/animations.css`
- **Responsive design** with mobile-first approach
- **Dark mode support** (ready for implementation)

## State Management

- **React Context** for global state (authentication, theme)
- **Local state** with useState and useReducer
- **Custom hooks** for reusable logic
- **API service layer** for data fetching

## API Integration

The frontend communicates with the backend through:

- **RESTful API** for CRUD operations
- **WebSocket** for real-time features
- **JWT authentication** with automatic token handling
- **Error handling** with user-friendly messages

## Performance Optimizations

- **Code splitting** with React.lazy()
- **Memoization** with React.memo()
- **Custom hooks** for logic reuse
- **Efficient re-renders** with proper dependency arrays
- **Image optimization** and lazy loading

## Testing

- **Jest** for unit testing
- **React Testing Library** for component testing
- **Custom test utilities** for common patterns
- **Mock API responses** for isolated testing

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder.

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
NODE_ENV=production
```

### Deployment Options

- **Netlify** - Static site hosting
- **Vercel** - React-optimized deployment
- **AWS S3** - Static website hosting
- **Docker** - Containerized deployment

## Browser Support

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:
- Create an issue on GitHub
- Contact the development team
- Check the documentation
