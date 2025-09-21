# Instructor Course Management - Test Plan

## Overview
This test plan verifies that the instructor course visibility and navigation issues have been resolved.

## Issues Fixed
1. **Course Visibility**: Instructors can now see their own courses
2. **Course Navigation**: Instructors can click into courses to manage content
3. **Lecture Addition**: Instructors can add lectures to their courses
4. **User-Center Association**: Course creation properly associates users with centers

---

## Test Scenarios

### 1. Course Visibility Test

**Objective**: Verify instructors can see their own courses after creation

**Steps**:
1. Log in as a tutor/instructor user
2. Navigate to `/instructor/courses`
3. Create a new course using the "Create New Course" button
4. Fill out course details:
   - Name: "Test CSS Course"
   - Description: "A test course for CSS preparation"
   - Max Students: 30
5. Submit the form
6. Verify the course appears in the instructor's course list immediately

**Expected Results**:
- ✅ Course appears in the list after creation
- ✅ Course shows correct instructor name
- ✅ Course status is "draft" by default
- ✅ Course enrollment shows 0/30 students

---

### 2. Course Navigation Test

**Objective**: Verify instructors can navigate to course detail pages

**Steps**:
1. From the instructor courses page (`/instructor/courses`)
2. Find a course in the list
3. Click the "Manage" button (blue button with settings icon)
4. Verify navigation to `/instructor/courses/[courseId]`
5. Verify course details are displayed correctly

**Expected Results**:
- ✅ Navigation works without errors
- ✅ Course detail page loads with correct data
- ✅ Course name, description, and stats are displayed
- ✅ Tabs (Overview, Content, Students, Analytics) are visible

---

### 3. Lecture Addition Test

**Objective**: Verify instructors can add lectures to their courses

**Prerequisites**: Complete Test 1 & 2, have a course to work with

**Steps**:
1. Navigate to course detail page (`/instructor/courses/[courseId]`)
2. Click on the "Content" tab
3. Click "Add Lecture" button (or "Add First Lecture" if no content exists)
4. Fill out the lecture form:
   - Title: "Introduction to CSS Basics"
   - YouTube URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   - Description: "Learn the fundamentals of CSS"
5. Submit the form
6. Verify the lecture appears in the content list

**Expected Results**:
- ✅ "Add Lecture" modal opens correctly
- ✅ Form validation works (required fields)
- ✅ YouTube URL validation works
- ✅ Lecture is added to course content
- ✅ Lecture appears in the content list with correct details

---

### 4. Database Consistency Test

**Objective**: Verify data persistence and database consistency

**Steps**:
1. Complete Tests 1-3
2. Log out and log back in as the same instructor
3. Navigate to `/instructor/courses`
4. Verify the course still appears
5. Navigate to the course detail page
6. Verify the lecture content is still there
7. Check that the user's `centerId` is properly set in the database

**Expected Results**:
- ✅ Course persists after logout/login
- ✅ Lecture content persists
- ✅ User has a `centerId` assigned
- ✅ Course belongs to the correct center

---

### 5. Role-Based Access Test

**Objective**: Verify only authorized users can access instructor features

**Steps**:
1. Create/use a student account
2. Try to navigate directly to `/instructor/courses`
3. Try to navigate directly to `/instructor/courses/[courseId]`
4. Verify appropriate access controls

**Expected Results**:
- ✅ Student users are redirected or shown access denied
- ✅ Only tutor/instructor roles can access instructor pages
- ✅ Protected routes work correctly

---

### 6. Cross-Browser Compatibility Test

**Objective**: Verify functionality across different browsers

**Steps**:
1. Repeat Tests 1-3 in Chrome
2. Repeat Tests 1-3 in Firefox
3. Repeat Tests 1-3 in Safari (if available)
4. Test on mobile browser (responsive design)

**Expected Results**:
- ✅ All functionality works in Chrome
- ✅ All functionality works in Firefox
- ✅ All functionality works in Safari
- ✅ Mobile experience is usable

---

### 7. Error Handling Test

**Objective**: Verify proper error handling and user feedback

**Steps**:
1. Try creating a course with empty title
2. Try adding a lecture with invalid YouTube URL
3. Try navigating to non-existent course ID
4. Test with network connectivity issues

**Expected Results**:
- ✅ Form validation prevents submission with missing required fields
- ✅ Invalid YouTube URLs are rejected with clear error message
- ✅ Non-existent courses show "Course Not Found" with back button
- ✅ Network errors are handled gracefully

---

## Manual Testing Checklist

### Pre-Test Setup
- [ ] Database is running and accessible
- [ ] Application is running on development server
- [ ] Test user accounts are available (student and tutor roles)
- [ ] Browser developer tools are open for debugging

### Test Execution
- [ ] **Test 1**: Course Visibility Test completed
- [ ] **Test 2**: Course Navigation Test completed  
- [ ] **Test 3**: Lecture Addition Test completed
- [ ] **Test 4**: Database Consistency Test completed
- [ ] **Test 5**: Role-Based Access Test completed
- [ ] **Test 6**: Cross-Browser Compatibility Test completed
- [ ] **Test 7**: Error Handling Test completed

### Post-Test Verification
- [ ] No console errors during testing
- [ ] All database records are consistent
- [ ] User experience is smooth and intuitive
- [ ] Performance is acceptable

---

## Automated Testing (Future Enhancement)

Consider adding these automated tests to the test suite:

```javascript
// Example test structure
describe('Instructor Course Management', () => {
  it('should allow instructors to see their courses', async () => {
    // Test implementation
  });
  
  it('should allow instructors to navigate to course details', async () => {
    // Test implementation
  });
  
  it('should allow instructors to add lectures', async () => {
    // Test implementation
  });
});
```

---

## Success Criteria

The fix is considered successful when:

1. ✅ Instructors can see their own courses immediately after creation
2. ✅ Instructors can navigate to course detail pages without errors
3. ✅ Instructors can add lectures to their courses
4. ✅ All data persists correctly in the database
5. ✅ Role-based access controls work properly
6. ✅ User experience is intuitive and error-free

---

## Rollback Plan

If issues are discovered during testing:

1. **Database Issues**: Restore from backup if needed
2. **Code Issues**: Revert the following changes:
   - `/lib/course-context.tsx` - `getInstructorCourses` function
   - `/app/api/courses/route.ts` - course creation API
   - `/app/instructor/courses/[courseId]/page.tsx` - new course detail page
   - `/app/instructor/courses/page.tsx` - navigation updates

3. **Deployment Issues**: Revert to previous stable version

---

*Test Plan Created*: 2025-09-13
*Last Updated*: 2025-09-13
*Version*: 1.0