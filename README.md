# LMS Admin Dashboard

A comprehensive Learning Management System (LMS) Admin Dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎯 Features

### Dashboard Overview
- Real-time statistics and metrics
- Quick action cards for common tasks
- Recent student signups
- Recent task submissions
- Support ticket overview
- Visual analytics and charts

### Student Management
- Complete student list with search and filters
- Detailed student profiles with tabbed interface
  - Profile information
  - Course progress tracking
  - Task submissions and evaluations
  - Project management
  - Badge achievements
  - Certificate status
  - Support history
- Student actions: Edit, Reset Password, Block/Unblock

### Courses & Content
- Course management (Create, Edit, Archive)
- Week-wise content organization
- Video upload and management
- Lock/Unlock weeks
- Student enrollment tracking

### Tasks & Projects
- Task creation and management
- Submission tracking
- Bulk evaluation interface
- Project milestone tracking
- Approval workflows
- Feedback system

### Badges System
- Gamification through achievements
- Badge categories (Completion, Tasks, Achievement, Community)
- Manual badge assignment
- Badge analytics

### Certificates
- Automated eligibility checking
- Approval workflow
- Certificate generation
- Revoke and reissue functionality
- Certificate ID tracking

### Support Tickets
- Ticket management system
- Priority-based organization
- Status tracking (Open, In Progress, Resolved, Closed)
- Category filtering
- Response time analytics

### Reports & Analytics
- Student growth charts
- Course completion rates
- Certificate statistics
- Task performance metrics
- Export functionality (CSV/PDF)

### Settings
- Admin profile management
- Security settings (Password, 2FA)
- Notification preferences
- Email template management
- System configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Run development server:**
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

### Default Login
- Navigate to `/login`
- Use your admin credentials
- Dashboard redirects to `/admin/dashboard`

## 📁 Project Structure

```
admin/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── students/           # Student management
│   │   │   ├── courses/            # Course management
│   │   │   ├── tasks/              # Tasks & submissions
│   │   │   ├── projects/           # Project management
│   │   │   ├── badges/             # Badge system
│   │   │   ├── certificates/       # Certificate management
│   │   │   ├── support/            # Support tickets
│   │   │   ├── reports/            # Analytics & reports
│   │   │   └── settings/           # System settings
│   │   ├── login/                  # Login page
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   └── components/
│       └── layout/
│           ├── Sidebar.tsx         # Navigation sidebar
│           └── Topbar.tsx          # Top navigation bar
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 Design System

### Color Palette
- **Primary Red:** `#C81E4E`
- **Secondary Pink:** `#D91E5B`
- **Success Green:** `#10B981`
- **Warning Orange:** `#F59E0B`
- **Info Blue:** `#3B82F6`
- **Danger Red:** `#EF4444`

### UI Components
- Cards with hover effects
- Gradient buttons
- Status badges
- Progress bars
- Tabbed interfaces
- Modal dialogs
- Data tables with pagination

## 🔐 Role-Based Access Control

The dashboard supports role-based permissions:
- **Super Admin:** Full access to all features
- **Admin:** Standard administrative access
- **Mentor:** Limited access to assigned students

Configure roles in Supabase database with proper RLS policies.

## 📊 Database Integration

### Supabase Tables Required:
- `users` - Student and admin profiles
- `courses` - Course information
- `weeks` - Week-wise content structure
- `videos` - Learning videos
- `video_progress` - Student video completion tracking
- `tasks` - Assignments and tasks
- `task_submissions` - Student submissions
- `projects` - Student projects
- `project_milestones` - Project tracking
- `badges` - Achievement badges
- `user_badges` - Student badge assignments
- `certificates` - Certificate records
- `tickets` - Support tickets
- `ticket_messages` - Ticket conversations

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** React Icons (Feather Icons)
- **Charts:** Recharts
- **Database:** Supabase
- **Authentication:** Supabase Auth

## 📱 Responsive Design

The dashboard is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Laptop (1440px)
- Tablet (768px)
- Mobile (375px+)

## 🔄 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway

## 📄 License

This project is part of the LMS platform.

## 👥 Support

For support and queries:
- Email: admin@lms.com
- Documentation: [Link to docs]

## 🎯 Future Enhancements

- [ ] Bulk student import (CSV)
- [ ] Advanced filtering and search
- [ ] Email notification system
- [ ] Mobile app integration
- [ ] AI-powered insights
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced reporting with filters
- [ ] Automated certificate generation
- [ ] Video conferencing integration

---

Built with ❤️ using Next.js and Tailwind CSS
