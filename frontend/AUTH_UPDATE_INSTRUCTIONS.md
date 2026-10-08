# Authentication Flow Update Instructions

## Summary of Changes Needed

To implement the requested authentication flow updates, you need to make the following changes:

### 1. Create New Files

#### File: ../frontend/lib/hooks/useAuth.ts
[Content omitted for brevity - see full instructions in the actual file]

#### File: ../frontend/components/ui/avatar.tsx
[Content omitted for brevity - see full instructions in the actual file]

### 2. Modify Existing File: ../frontend/components/site-header.tsx
[See full instructions in the actual file]

### 3. What These Changes Do

1. useAuth Hook: Checks authentication state from localStorage
2. Avatar Component: Displays profile image or falls back to initials
3. SiteHeader Modifications: Shows avatar when authenticated, redirects auth pages, handles loading state

### 4. How to Install

1. Create the two new files
2. Replace the existing site-header.tsx file
3. Restart your frontend development server


