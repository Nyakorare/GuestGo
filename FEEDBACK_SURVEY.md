# Feedback Survey Feature

## Overview
The feedback survey feature allows visitors to provide feedback on their completed visits using ISO 25010 quality standards. This helps improve the system and user experience.

## Features

### 1. Feedback Survey Button
- Appears only on completed visits in the "Past Schedules" tab of the visitor dashboard
- Button shows "Feedback Survey" for visits without feedback
- Button shows "Feedback Submitted" (disabled) for visits with existing feedback
- One feedback submission per visit is allowed

### 2. ISO 25010 Quality Assessment
The survey includes ratings (1-5 scale) for the following quality characteristics:

1. **Functional Suitability** - Did the system provide all expected functions?
2. **Performance Efficiency** - Was the system's response time satisfactory?
3. **Compatibility** - Did the system work well with your device/browser?
4. **Usability** - Was the system easy to use and navigate?
5. **Reliability** - Did the system work reliably without errors?
6. **Security** - Did you feel your information was secure?
7. **Maintainability** - Did the system appear well-maintained?
8. **Portability** - Did the system work consistently across devices?

### 3. Additional Features
- Overall satisfaction rating (1-5 scale)
- Optional comments field (max 1000 characters)
- Real-time character count for comments
- Form validation for all required fields

## Database Schema

### visit_feedback Table
```sql
CREATE TABLE visit_feedback (
    id UUID PRIMARY KEY,
    visit_id UUID REFERENCES scheduled_visits(id),
    visitor_user_id UUID REFERENCES auth.users(id),
    visitor_email VARCHAR(255),
    
    -- ISO 25010 Quality Ratings (1-5)
    functional_suitability INTEGER,
    performance_efficiency INTEGER,
    compatibility INTEGER,
    usability INTEGER,
    reliability INTEGER,
    security INTEGER,
    maintainability INTEGER,
    portability INTEGER,
    
    -- Additional feedback
    overall_satisfaction INTEGER,
    comments TEXT,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    
    UNIQUE(visit_id) -- One feedback per visit
);
```

## API Functions

### submit_visit_feedback()
Submits feedback for a completed visit.

**Parameters:**
- `p_visit_id` - UUID of the visit
- `p_functional_suitability` - Rating 1-5
- `p_performance_efficiency` - Rating 1-5
- `p_compatibility` - Rating 1-5
- `p_usability` - Rating 1-5
- `p_reliability` - Rating 1-5
- `p_security` - Rating 1-5
- `p_maintainability` - Rating 1-5
- `p_portability` - Rating 1-5
- `p_overall_satisfaction` - Rating 1-5
- `p_comments` - Optional text comments

**Returns:**
```json
{
  "success": true,
  "feedback_id": "uuid",
  "message": "Feedback submitted successfully"
}
```

### has_feedback_for_visit()
Checks if feedback already exists for a visit.

**Parameters:**
- `p_visit_id` - UUID of the visit

**Returns:**
- `boolean` - true if feedback exists, false otherwise

### get_feedback_statistics()
Gets aggregated feedback statistics (for admin/personnel use).

**Returns:**
```json
{
  "total_feedback": 10,
  "average_ratings": {
    "functional_suitability": 4.2,
    "performance_efficiency": 4.0,
    "compatibility": 4.5,
    "usability": 4.3,
    "reliability": 4.1,
    "security": 4.4,
    "maintainability": 4.0,
    "portability": 4.2,
    "overall_satisfaction": 4.2
  },
  "feedback_with_comments": 7,
  "recent_feedback": [...]
}
```

## Security & Permissions

### Row Level Security (RLS)
- Visitors can only submit feedback for their own visits
- Visitors can view their own feedback
- Personnel and admins can view all feedback
- One feedback submission per visit is enforced

### Validation
- All ratings must be between 1-5
- Visit must be in "completed" status
- Feedback can only be submitted once per visit
- Comments are limited to 1000 characters

## Usage

### For Visitors
1. Navigate to the visitor dashboard
2. Go to the "Past Schedules" tab
3. Find a completed visit
4. Click the "Feedback Survey" button
5. Fill out the survey with ratings and optional comments
6. Submit the feedback

### For Administrators
1. Access the database directly or create admin interface
2. Use `get_feedback_statistics()` to view aggregated data
3. Query `visit_feedback` table for detailed feedback

## Files Modified/Created

### New Files
- `src/components/FeedbackSurveyModal.ts` - Feedback survey modal component
- `supabase/migrations/10_add_feedback_survey.sql` - Database migration
- `FEEDBACK_SURVEY.md` - This documentation

### Modified Files
- `src/pages/dashboard/index.ts` - Added feedback button and integration

## Future Enhancements
- Admin dashboard for viewing feedback statistics
- Email notifications for feedback submissions
- Export feedback data functionality
- Feedback analytics and reporting
- Integration with system improvement workflows
