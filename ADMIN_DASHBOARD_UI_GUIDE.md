# Admin Dashboard - UI/UX Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Academic Leave Portal  [Admin Dashboard] [Results] [Logout] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                         │
│                                                              │
│ User Management                                             │
│ [Add Student] [Add Admin] [Remove User] [View Test Results] │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ 📋 Leave Management │ 👨‍🎓 Students (15) │ 👤 Admins (3) │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│  [Leave Management Content Shows Here]                      │
│  OR                                                          │
│  [Students Table Shows Here]                               │
│  OR                                                          │
│  [Admins Table Shows Here]                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Students Tab - Table View

```
┌──────────────┬──────────────┬──────────────┬───────────┬─────────────────┐
│ Name         │ Email        │ Password     │ Dept      │ Leave Balance   │
├──────────────┼──────────────┼──────────────┼───────────┼─────────────────┤
│ John Doe     │ john@...     │ pass123      │ CS        │ 10              │
│ Jane Smith   │ jane@...     │ secure456    │ IT        │ 8               │
│ Bob Johnson  │ bob@...      │ mypass789    │ EC        │ 12              │
│ Alice Brown  │ alice@...    │ pwd2024      │ ME        │ 5               │
└──────────────┴──────────────┴──────────────┴───────────┴─────────────────┘

Status Column:   ✓ Active (Green)    ✗ Inactive (Red)
Created Column:  01/23/2026          (Date format)
```

## Color Scheme

- **Tab Active Color**: #4a90e2 (Blue) - Bottom border highlight
- **Student Row Hover**: #f0f4ff (Light Blue)
- **Admin Row Hover**: #fff3cd (Light Yellow)
- **Active Status**: #c8e6c9 (Light Green) with #2e7d32 (Dark Green) text
- **Inactive Status**: #ffcdd2 (Light Red) with #c62828 (Dark Red) text
- **Header Background**: #f5f5f5 (Light Gray)
- **Code Block Background**: #f5f5f5 (Light Gray)
- **Alternating Rows**: White / #fafafa (Very Light Gray)

## Interactive Elements

### Tab Buttons
- Default: Gray text, no underline
- Active: Blue text, blue bottom border (3px)
- Hover: Smooth transition effect
- Icon + Text: 📋 Leave Management | 👨‍🎓 Students | 👤 Admins

### Table Rows
- Hover Effect: Background color change
- Student Rows: Light Blue on hover
- Admin Rows: Light Yellow on hover
- Transition: 0.2s smooth transition

### Status Badges
- Active: Green background with checkmark (✓)
- Inactive: Red background with X mark (✗)
- Bold, centered text
- Padding: 4px 8px
- Border-radius: 4px

## Data Display Format

### Email & Password
```
┌─────────────────────────┐
│ john.doe@college.edu    │  ← Code block styling
│ Np7#kL9@Qx2             │  ← Monospace font
└─────────────────────────┘
```

### Dates
Format: MM/DD/YYYY (e.g., 01/23/2026)

### Leave Balance
Simple number: 10, 8, 12, etc.

## Responsive Behavior

### Desktop (1200px+)
- Full table display
- All columns visible
- Comfortable spacing

### Tablet (768px - 1199px)
- Horizontal scroll enabled
- Table maintains structure
- Columns still readable

### Mobile (< 768px)
- Horizontal scroll for tables
- Stackable layout
- Touch-friendly spacing

## Accessibility Features

- Clear visual hierarchy with headings
- Color-coded status indicators (not color-only)
- Checkmark/X symbols with text
- Proper table structure with headers
- Hover states for interactive elements
- Adequate contrast ratios

## Performance Indicators

### Loading State
- Shows: "Loading..." message
- Disables tabs until data loads
- Error messages displayed clearly

### Empty States
- "No students registered yet." - for empty Students tab
- "No admins registered yet." - for empty Admins tab
- "No pending leaves." - for empty leave section

## Security Recommendations

The passwords are displayed in plaintext. In production, consider:

1. **Password Visibility Toggle** - Show/Hide password button
2. **Masked View** - Display as dots by default
3. **Audit Logging** - Log who viewed credentials and when
4. **Role-Based Access** - Only super-admins can view passwords
5. **Time-Limited Access** - Credentials only visible for limited time
6. **Password Reset Option** - Instead of showing passwords

## Future Enhancements

- [ ] Search bar for filtering users
- [ ] Sort by column headers (Name ↑↓, Email ↑↓, etc.)
- [ ] Pagination (10, 25, 50 rows per page)
- [ ] Export to CSV functionality
- [ ] Bulk actions (Activate/Deactivate)
- [ ] Edit user details inline
- [ ] Password visibility toggle
- [ ] Advanced filters (Department, Status)
- [ ] User activity logs
- [ ] Bulk import users from file
