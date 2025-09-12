# Buyer Lead Intake App

A comprehensive lead management system built with Next.js, TypeScript, and SQLite. This application allows users to capture, manage, and track buyer leads with advanced filtering, search capabilities, and CSV import/export functionality.

## Features

### Core Functionality
- **Lead Management**: Create, read, update, and delete buyer leads
- **Advanced Search & Filtering**: Search by name, phone, email with real-time filtering
- **Pagination**: Server-side pagination with URL-synced state
- **CSV Import/Export**: Bulk import up to 200 leads with validation and error reporting
- **Lead History**: Track all changes with detailed audit trail
- **Ownership Control**: Users can only edit their own leads

### Data Model
- **Buyers Table**: Complete lead information including contact details, property preferences, budget, and timeline
- **Buyer History**: Audit trail for all changes with user tracking
- **Users Table**: Simple user management for authentication

### Validation & Security
- **Zod Validation**: Client and server-side validation with comprehensive error handling
- **Rate Limiting**: API rate limiting to prevent abuse
- **Concurrency Control**: Optimistic locking to prevent data conflicts
- **Input Sanitization**: XSS protection and data validation

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: SQLite with better-sqlite3
- **Validation**: Zod
- **Forms**: React Hook Form with Zod resolver
- **UI Components**: Custom components with Radix UI primitives
- **Testing**: Jest with comprehensive test coverage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buyer-lead-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database Configuration (for production)
   DATABASE_URL=libsql://your-database-url
   DATABASE_AUTH_TOKEN=your-auth-token
   
   # Next.js Configuration
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Initialize the database**
   ```bash
   # The app will automatically create the SQLite database on first run
   npm run dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

The application uses SQLite for local development. The database file (`local.db`) will be created automatically when you first run the application.

For production, you can configure it to use:
- Turso (LibSQL)
- PostgreSQL
- MySQL

Update the database configuration in `src/lib/db/index.ts` and `drizzle.config.ts` accordingly.

## Project Structure

```
buyer-lead-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── buyers/            # Buyer management pages
│   │   └── signin/            # Authentication pages
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── buyers/           # Buyer-specific components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions and configurations
│   │   ├── db/               # Database schema and queries
│   │   ├── validations/      # Zod schemas
│   │   └── utils.ts          # Helper functions
│   └── components/           # Shared components
├── drizzle/                  # Database migrations
├── scripts/                  # Utility scripts
└── tests/                    # Test files
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with email
- `POST /api/auth/signout` - Sign out

### Buyers
- `GET /api/buyers` - List buyers with filtering and pagination
- `POST /api/buyers` - Create a new buyer
- `PUT /api/buyers` - Bulk import buyers from CSV
- `GET /api/buyers/[id]` - Get buyer details
- `PUT /api/buyers/[id]` - Update buyer
- `DELETE /api/buyers/[id]` - Delete buyer
- `GET /api/buyers/[id]/history` - Get buyer change history
- `GET /api/buyers/export` - Export buyers as CSV

## Data Model

### Buyers Table
```typescript
{
  id: string (UUID)
  fullName: string (2-80 chars)
  email?: string (valid email)
  phone: string (10-15 digits)
  city: enum (Chandigarh|Mohali|Zirakpur|Panchkula|Other)
  propertyType: enum (Apartment|Villa|Plot|Office|Retail)
  bhk?: enum (1|2|3|4|Studio) // Required for Apartment/Villa
  purpose: enum (Buy|Rent)
  budgetMin?: number (INR)
  budgetMax?: number (INR) // Must be >= budgetMin
  timeline: enum (0-3m|3-6m|>6m|Exploring)
  source: enum (Website|Referral|Walk-in|Call|Other)
  status: enum (New|Qualified|Contacted|Visited|Negotiation|Converted|Dropped)
  notes?: string (max 1000 chars)
  tags?: string[]
  ownerId: string (user ID)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Buyer History Table
```typescript
{
  id: string (UUID)
  buyerId: string (references buyers.id)
  changedBy: string (user ID)
  changedAt: timestamp
  diff: object (field changes: { old: any, new: any })
}
```

## Validation Rules

### Client & Server Validation
- **Full Name**: 2-80 characters, required
- **Phone**: 10-15 digits, required
- **Email**: Valid email format, optional
- **BHK**: Required for Apartment and Villa property types
- **Budget**: Max must be >= Min when both provided
- **Notes**: Maximum 1000 characters
- **Tags**: Array of strings, optional

### Business Rules
- Users can only edit/delete their own leads
- All users can view all leads
- Concurrent editing is prevented with optimistic locking
- Rate limiting: 5 create requests per minute per IP

## CSV Import/Export

### Import Format
CSV files must include these headers:
```
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
```

### Export
Exports respect current filters and include all buyer data in CSV format.

### Validation
- Maximum 200 rows per import
- Row-by-row validation with detailed error reporting
- Only valid rows are imported (transactional)

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage
- Zod validation schemas
- Form validation logic
- CSV import/export functionality
- Business rule validation

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL=your-production-database-url
DATABASE_AUTH_TOKEN=your-auth-token
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Comprehensive error handling
- Accessibility best practices

## Design Decisions

### Architecture
- **App Router**: Using Next.js 15 App Router for better performance and developer experience
- **Server Components**: Leveraging SSR for better SEO and performance
- **API Routes**: RESTful API design with proper HTTP status codes
- **Database**: SQLite for simplicity, easily configurable for production databases

### State Management
- **URL State**: Filters and pagination synced with URL for bookmarkable state
- **Form State**: React Hook Form for efficient form management
- **Server State**: Minimal client-side state, relying on server data

### Security
- **Authentication**: Simple email-based auth (easily extensible)
- **Authorization**: Ownership-based access control
- **Rate Limiting**: In-memory rate limiting (Redis recommended for production)
- **Input Validation**: Comprehensive validation on both client and server

### Performance
- **Pagination**: Server-side pagination to handle large datasets
- **Debounced Search**: Optimized search with 500ms debounce
- **Optimistic Updates**: Immediate UI feedback with rollback on error
- **Error Boundaries**: Graceful error handling and recovery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.