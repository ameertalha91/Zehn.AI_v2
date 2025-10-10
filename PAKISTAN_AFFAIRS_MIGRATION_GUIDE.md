# Pakistan Affairs Study Plan Migration Guide

## Overview
This guide explains how to migrate from the hardcoded study plan to a dynamic, syllabus-based system for Pakistan Affairs.

## What's Changed

### 1. **Database Schema Updates**
Added two new models to track CSS syllabus topics:
- `SyllabusTopic` - Stores official CSS exam topics
- `CourseTopicMapping` - Links courses to syllabus topics they cover

### 2. **Dynamic Study Plan Generation**
- Study plans now generate based on:
  - Student's enrolled courses
  - CSS syllabus topics covered by those courses
  - Topic priorities and time estimates
- Fallback to Pakistan Affairs default plan if no enrollments

### 3. **Removed Hardcoded Content**
- All static week/task data removed from API
- Plans now generate dynamically from syllabus structure

## Migration Steps

### Step 1: Update Database Schema
```bash
# Generate migration for new models
npx prisma migrate dev --name add-syllabus-topics

# Apply migration
npx prisma migrate deploy
```

### Step 2: Seed Syllabus Data
```bash
# Run the syllabus seed script
node scripts/seed-syllabus.js
```

### Step 3: Create Pakistan Affairs Courses
In the instructor dashboard, create courses that map to syllabus topics:
- "Constitutional Development in Pakistan"
- "Pakistan Movement and Ideology"
- "Contemporary Pakistan: Politics and Economy"
- "Pakistan Foreign Policy"

### Step 4: Map Courses to Topics (Optional)
The seed script will attempt to auto-map courses to topics based on names.
You can also manually map through the database or create an admin UI.

## Testing the Dynamic Study Plan

1. **As a student with no enrollments:**
   - Visit `/study-plan`
   - Should see default Pakistan Affairs 6-week plan
   - Topics come from CSS syllabus structure

2. **As a student with enrollments:**
   - Enroll in Pakistan Affairs courses
   - Visit `/study-plan`
   - Should see personalized plan based on enrolled courses

## File Structure

```
lib/
├── syllabus/
│   └── pakistan-affairs.ts    # CSS syllabus structure
scripts/
├── seed-syllabus.js          # Database seeding script
app/
├── api/
│   └── study-plan/
│       └── route.tsx         # Dynamic plan generation
└── study-plan/
    └── page.tsx              # Updated UI
```

## Future Enhancements

1. **Admin UI for Topic Management**
   - Create/edit syllabus topics
   - Map courses to topics
   - Set coverage depth

2. **Progress Tracking**
   - Store task completion in database
   - Track topic mastery levels
   - Generate progress reports

3. **AI-Driven Adaptation**
   - Analyze quiz performance
   - Adjust task difficulty
   - Recommend additional resources

4. **Multi-Subject Support**
   - Add other CSS subjects (IR, Current Affairs, etc.)
   - Cross-subject integration
   - Comprehensive exam preparation

## API Changes

### GET /api/study-plan
Now returns dynamic plans based on:
- User authentication
- Enrolled courses
- Syllabus topic mappings

### POST /api/study-plan
Actions supported:
- `update-task` - Mark tasks complete
- `generate-adaptive` - Future AI-driven planning

## Notes

- The system gracefully falls back to Pakistan Affairs if no courses enrolled
- Topic priorities (high/medium/low) affect task ordering
- Estimated hours from syllabus drive weekly planning
- Plans limited to 6 weeks for focused preparation

