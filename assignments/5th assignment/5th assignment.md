# GoalTrack - 5th Assignment

## Full Responsive Page Coding

### Description

In this assignment, we implemented a fully responsive landing page based on our high-fidelity prototypes from Assignment 4. The page is built using Next.js 16 with React and Tailwind CSS, ensuring optimal performance and responsiveness across all device sizes.

### Live Demo

**Production URL:** [https://hci-2025-26-project.vercel.app/](https://hci-2025-26-project.vercel.app/)

### Features Implemented

#### Landing Page Sections

1. **Hero Section**
   - Eye-catching headline with gradient text
   - Call-to-action button
   - Statistics display (10k+ users, 50k+ goals)
   - Professional hero image
   - Fully responsive layout (stacked on mobile, side-by-side on desktop)

2. **Features Section**
   - 6 feature cards with icons
   - Grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
   - Hover animations and scroll reveal effects

3. **How It Works Section**
   - 4-step process with numbered indicators
   - Two-column layout with image
   - Responsive design with stacked layout on mobile

4. **Statistics Section**
   - Gradient background
   - 4 key metrics displayed
   - Responsive grid layout

5. **Call-to-Action Section**
   - Gradient card design
   - Benefit badges
   - Dual button layout (primary + secondary)

6. **Footer**
   - 4-column layout (responsive)
   - Social media links
   - Contact information
   - Quick navigation links

#### Navigation

- **Desktop:** Horizontal navigation with logo, links, and CTA button
- **Mobile:** Hamburger menu with slide-down navigation panel
- Sticky header with blur effect

#### Blog Page

- Dynamic blog posts fetched from API
- Responsive grid layout (1/2/3 columns)
- **Smart pagination** with ellipsis for better UX
- Individual blog post pages

### Responsive Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md)
- **Desktop:** > 1024px (lg)

### Technologies Used

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Custom CSS animations + scroll-triggered effects
- **Deployment:** Vercel

### Screenshots

#### Desktop View
The landing page displays a two-column hero section with all features visible in a 3-column grid.

#### Mobile View
All sections stack vertically with a hamburger navigation menu for optimal mobile experience.

### How to Run Locally

```bash
# Clone the repository
git clone https://github.com/goretante/HCI-2025-26-project.git

# Navigate to project directory
cd HCI-2025-26-project/goaltrack

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Focus states for interactive elements
- Sufficient color contrast
- Keyboard navigation support

### Performance Optimizations

- Next.js Image optimization
- Lazy loading for below-fold images
- Efficient CSS with Tailwind
- Server-side rendering where applicable
