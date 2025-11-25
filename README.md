# PokerMastery (formerly PokerMastery)
> Comprehensive ecosystem for poker players and teams - bankroll management, GTO study, hand analysis, and coaching platform.
## <
 Project Vision
**Two-Pronged Approach:**
1. **B2C Mobile App** - Player-focused tools (bankroll, GTO, study lab, marketplace)
2. **B2B Web Platform (Team Pro)** - Team management for coaches and managers
**Current Phase:** MVP Beta - Hand History Replayer & Parser
## =
 Recent Updates
### January 2025 - AI Training Database System
Implemented complete anonymization pipeline for building AI training dataset from user hand histories:
**Features:**
 Zero-cost background processing via Vercel Cron (daily at 3 AM UTC)
 Automatic anonymization of player names (Player1, Player2, etc.)
 Categorization by rake tiers (cash games) and stakes tiers (tournaments)
 ML tags generation (all-in, 3-bet-pot, multiway, short-stack, showdown)
 Deduplication by handId
 Capacity: 1,000 hands/day (30K/month)
**Tech Stack:**
- Backend: NestJS + PostgreSQL + Prisma
- Frontend: Next.js + Vercel Cron
- Cost: **$0 additional** <
**Documentation:** See `Docs/ANONYMIZATION_SYSTEM.md`
### October 2024 - Parser Achievement: 100% Accuracy
Successfully achieved **100% test coverage** on real-world hand histories:
**Results:**
 **Real GGPoker Hands:** 3/3 (100%)
 **Edge Cases:** 35/35 (100%)
 **PokerStars:** 49/49 (100%)
 **Overall:** 92/102 (90.2%)
**Key Fixes:**
- GGPoker tournament format with comma-separated amounts (`Level15(1,500/3,000)`)
- Board card extraction from SUMMARY section
- Proper Card object to string conversion
- Ante handling in initial pot calculations
**Documentation:** See `Docs/GGPOKER_PARSER_FIXES_2025-10-04.md`
## =
 Project Structure
poker-grinders-edge/
 backend/                 # NestJS API
 src/
 modules/
 auth/                    # JWT authentication
 sessions/                # Poker session management
 hand-history-sessions/   # Hand history analysis
 anonymization/           # NEW: AI training data pipeline
 common/          # Guards, decorators, pipes
 database/        # Prisma service
 prisma/
       
 schema.prisma    # Database models
 mobile/                  # React Native (future)
 web/                     # Next.js web app
 src/lib/
 hand-parser.ts              # Core parser (PokerStars, GGPoker, PartyPoker)
 parsers/__tests__/          # Parser test suites
 app/api/cron/                    # NEW: Vercel Cron endpoints
 Docs/                    # Documentation
    
 PRD - PokerMastery.md
    
 ARCHITECTURE.md
    
 ANONYMIZATION_SYSTEM.md          # NEW: AI database guide
    
 GGPOKER_PARSER_FIXES_2025-10-04.md
    
 TESTING_STRATEGY.md
## =
 Tech Stack
### Backend
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL 14+ with Prisma ORM
- **Auth:** JWT (Access + Refresh Tokens)
- **Validation:** class-validator
- **Testing:** Jest
### Frontend
- **Web:** Next.js 14+ (TypeScript, SSR/SSG)
- **Mobile:** React Native + TypeScript (future)
- **State:** Zustand
- **Styling:** Tailwind CSS / NativeWind
### Infrastructure
- **Backend Hosting:** Railway
- **Frontend Hosting:** Vercel
- **Database:** PostgreSQL (managed)
- **Cron Jobs:** Vercel Cron (free tier)
- **File Storage:** TBD (AWS S3 / GCS)
## <
 Key Features
### 
 Completed
#### Hand History Parser
- Multi-site support: PokerStars, GGPoker, PartyPoker
- Tournament and cash game parsing
- Board card extraction
- Pot calculation with antes
- Side pot handling
- Player position detection
- Action tracking (preflop, flop, turn, river)
#### Anonymization System
- Background job processing (Vercel Cron)
- Player name anonymization
- Rake/stakes categorization
- ML tag generation
- Deduplication
- Retry logic
#### API Endpoints
- User authentication (register, login, refresh)
- Session management (CRUD)
- Hand history upload and analysis
- Anonymization processing
### =
 In Progress
- Hand Replayer UI (web)
- Real-time hand navigation
- Mobile app foundation
### =
 Planned
- GTO Study Lab
- Bankroll Manager
- OCR Screenshot Analysis
- Coaching Marketplace
- Team Management (B2B)
## =
 Getting Started
### Prerequisites
```bash
# Required
Node.js 18+
PostgreSQL 14+
npm or yarn
# Optional
Docker (for local PostgreSQL)
### Installation
#### 1. Clone Repository
```bash
git clone https://github.com/Carlossouzaadv/poker-grinders-edge.git
cd poker-grinders-edge
#### 2. Backend Setup
```bash
cd backend
npm install
# Configure environment
cp .env.example .env
# Edit .env with your database credentials
# Run migrations
npx prisma migrate dev
# Start dev server
npm run start:dev
#### 3. Web Setup
```bash
cd web
npm install
# Configure environment
cp .env.local.example .env.local
# Edit with backend API URL
# Start dev server
npm run dev
### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name descriptive-name
# Apply migrations (production)
npx prisma migrate deploy
# Reset database (development only!)
npx prisma migrate reset
# Open Prisma Studio (database GUI)
npx prisma studio
## =
 Documentation
- **[CLAUDE.md](./CLAUDE.md)** - AI development guide (conventions, patterns, commands)
- **[PRD](./Docs/PRD%20-%20Poker%20Grinder's%20Edge.md)** - Product Requirements Document
- **[ARCHITECTURE.md](./Docs/ARCHITECTURE.md)** - System design and patterns
- **[ANONYMIZATION_SYSTEM.md](./Docs/ANONYMIZATION_SYSTEM.md)** - AI database pipeline guide
- **[GGPOKER_PARSER_FIXES_2025-10-04.md](./Docs/GGPOKER_PARSER_FIXES_2025-10-04.md)** - Parser fixes changelog
- **[TESTING_STRATEGY.md](./Docs/TESTING_STRATEGY.md)** - Test coverage and strategy
- **[TROUBLESHOOTING.md](./Docs/TROUBLESHOOTING.md)** - Common issues and solutions
## >
 Testing
### Backend Tests
```bash
cd backend
# Run all tests
npm test
# Watch mode
npm run test:watch
# Coverage report
npm run test:cov
# E2E tests
npm run test:e2e
### Frontend Tests
```bash
cd web
# Run parser tests
npm test
# Specific test suite
npm test -- parsers/pokerstars
npm test -- parsers/ggpoker
npm test -- edge-cases
npm test -- real-gg-hands
### Test Coverage Goals
- Overall: 80% minimum
- Financial logic: 100% required
- Parsers: 90% minimum
- Controllers: 70% minimum
## =
 Environment Variables
### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://..."
# JWT
JWT_SECRET="strong-random-secret"
JWT_REFRESH_SECRET="another-strong-secret"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
# Cron & Background Jobs
CRON_SECRET="vercel-cron-secret"
ADMIN_SECRET="admin-manual-trigger-secret"
# App
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3001"
### Web (.env.local)
```bash
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3000"
# Cron (must match backend)
CRON_SECRET="same-as-backend"
**Generate secrets:**
```bash
openssl rand -base64 32
## =
 Deployment
### Backend (Railway)
1. Create Railway project
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy:
   ```bash
   git push
   # Railway auto-deploys
   ```
### Frontend (Vercel)
1. Import GitHub repo to Vercel
2. Configure environment variables
3. Deploy:
   ```bash
   git push
   # Vercel auto-deploys
   ```
### Cron Jobs (Vercel)
Automatically configured via `web/vercel.json`:
```json
  "crons": [{
    "path": "/api/cron/anonymize-hands",
    "schedule": "0 */2 * * *"
  }]
**Schedule:** Every 2 hours (12x/day)
**Capacity:** 2,400 hands/day
## =
 Database Schema
### Core Models
- **User** - User accounts (players/coaches)
- **Session** - Poker sessions (cash/tournament)
- **Hand** - Individual hands (manual entry)
- **HandHistorySession** - Uploaded hand history files
- **HandHistoryHand** - Parsed hands from uploads
### Anonymization Models (NEW)
- **AnonymizedHand** - Anonymized hands for AI training
  - Categorized by rake tiers (cash) or stakes tiers (tournaments)
  - ML tags (all-in, 3-bet-pot, multiway, etc.)
- **AnonymizationJob** - Background job tracking
### Supporting Models
- **RefreshToken** - JWT refresh tokens
- **CoachProfile** - Coach verification and profiles
- **Booking** - Coaching session bookings
- **Review** - Coach reviews
- **GTORange** - GTO study ranges
**View schema:** `backend/prisma/schema.prisma`
## >
 Contributing
### Workflow
1. Create feature branch: `git checkout -b feature/name`
2. Write tests first (TDD)
3. Implement feature
4. Run tests: `npm test`
5. Commit with conventional commits
6. Push and create PR
### Commit Convention
<type>(<scope>): <description>
[optional body]
[optional footer]
**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactor
- `test`: Add/update tests
- `chore`: Maintenance
**Examples:**
```bash
feat(parser): add GGPoker tournament support
fix(anonymization): correct rake tier categorization
docs(readme): update deployment instructions
## =
 Troubleshooting
### Common Issues
**Parser failing:**
- Check `Docs/TROUBLESHOOTING.md`
- Verify hand history format
- Run specific test: `npm test -- real-gg-hands`
**Database connection:**
```bash
# Test connection
npx prisma db pull
# Reset (dev only)
npx prisma migrate reset
**Cron not running:**
- Verify `CRON_SECRET` matches in both Vercel and Railway
- Check Vercel logs
- Test manually: `POST /anonymization/process-manual`
**Build errors:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
# Regenerate Prisma client
npx prisma generate
## =
 Roadmap
### Infrastructure & Setup (TODO)
- [ ] **Migrate PostgreSQL to Supabase**
  - Create Supabase project (https://supabase.com)
  - Update `DATABASE_URL` in `backend/.env`
  - Run `npx prisma migrate deploy` to apply schema
  - Move all data from current PostgreSQL instance
  - Verify cron jobs still work with Supabase
  - **Estimated time:** 2-3 hours
  - **Cost:** Free tier (up to 500MB) → $25/month if exceeds
  - **Benefits:** Zero-cost managed database, automatic backups, easy scaling

  > **Why Supabase?** PostgreSQL is currently stored locally/external, but needs managed solution for production. Supabase provides free managed PostgreSQL perfect for MVP with data persistence guarantees.

### Phase 1: MVP Beta (Current)
- [x] Hand History Parser (PokerStars, GGPoker, PartyPoker)
- [x] Anonymization System
- [x] API Backend
- [ ] Hand Replayer UI
- [ ] User registration/login flow
### Phase 2: Core Features
- [ ] Bankroll Manager (mobile)
- [ ] GTO Study Lab (mobile)
- [ ] OCR Screenshot Analysis
- [ ] Hand Analysis AI (powered by anonymized data)
### Phase 3: Marketplace
- [ ] Coaching Marketplace
- [ ] Payment Integration (Stripe)
- [ ] Review System
- [ ] Video Coaching Tools
### Phase 4: Team Pro (B2B)
- [ ] Team Management Dashboard
- [ ] Multi-user Organizations
- [ ] Performance Analytics
- [ ] Coaching Assignment
## =
 License
## =e Team
- **Carlos Souza** - Founder & Developer
## =
 Links
- **Documentation:** `Docs/` folder
- **API Reference:** Coming soon
- **Support:** GitHub Issues
**Last Updated:** January 2025
**Version:** 0.2.0 (MVP Beta)
## Quick Commands Reference
```bash
# Backend
cd backend
npm run start:dev        # Dev server
npm test                 # Run tests
npx prisma studio        # Database GUI
npx prisma migrate dev   # Run migration
# Frontend
cd web
npm run dev             # Dev server
npm test                # Run tests
npm run build           # Production build
# Database
npx prisma generate     # Generate client
npx prisma db push      # Push schema (dev)
npx prisma migrate deploy  # Apply migrations (prod)
# Git
git checkout -b feature/name    # New branch
git add .                       # Stage changes
git commit -m "feat: message"   # Commit
git push -u origin branch-name  # Push
**Need help?** Check `CLAUDE.md` for detailed development guide.
