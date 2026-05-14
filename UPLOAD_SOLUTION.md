# Upload Folder Preservation Solution

## Problem
The CI/CD pipeline was deleting the `uploads` folder containing user-uploaded images during deployment because:

1. The deployment process replaces directories without preserving user data
2. The `uploads` directory was excluded from git via `.gitignore`
3. Uploaded files were being lost on each deployment

## Solution Implemented

### 1. Modified CI/CD Pipeline
- Added backup step before deployment to save existing uploads
- Added restore step after deployment to recover uploaded files
- Files are temporarily stored in `/tmp/uploads-backup` during deployment

### 2. Updated File Paths
- Changed upload destinations from `src/uploads/` to `uploads/` (outside source directory)
- Updated static file serving path in `app.ts`
- Updated file deletion paths in controllers

### 3. Git Configuration
- Modified `.gitignore` to preserve directory structure but ignore uploaded files
- Added `.gitkeep` files to maintain empty directories in git

### 4. Directory Structure
```
backend/
├── uploads/
│   ├── .gitkeep
│   ├── avatars/
│   │   └── .gitkeep
│   ├── games_thumbs/
│   │   └── .gitkeep
│   └── game/
│       └── .gitkeep
└── src/
    └── ... (application code)
```

## Benefits
- ✅ User-uploaded files are preserved during deployments
- ✅ Directory structure is maintained in git
- ✅ No manual intervention required
- ✅ Automatic backup and restore process

## Files Modified
1. `.github/workflows/deploy.yml` - Added backup/restore steps
2. `backend/src/routes/admin/avatar.routes.ts` - Updated paths
3. `backend/src/routes/admin/game.routes.ts` - Updated paths
4. `backend/src/app.ts` - Updated static file serving
5. `backend/src/controllers/admin/avatar.controller.ts` - Updated file deletion paths
6. `backend/src/controllers/admin/game.controller.ts` - Updated file deletion paths
7. `backend/.gitignore` - Modified to preserve structure
8. Created `backend/uploads/` directory structure with `.gitkeep` files

## Testing
After pushing these changes:
1. Upload some test images
2. Push new code changes
3. Verify uploaded images are still accessible after deployment 