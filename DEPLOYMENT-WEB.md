# Web-Based Deployment Guide

## Information You'll Need

**Project ID**: `book-landing-page`

**APP_KEY** (generated): `aI2pduWLRwtVw5lALD5SLg3KbO+TxAEWzRs3FYkWTfE=`

**Database Password**: [The password you set for Cloud SQL postgres user]

---

## Step 1: Wait for Cloud SQL to Finish Creating ✅ IN PROGRESS

The Cloud SQL instance `book-landing-db` is being created. This takes 5-10 minutes.

You'll know it's ready when you see a green checkmark in the SQL instances list.

---

## Step 2: Create Database and User

Once Cloud SQL is ready:

1. Go to: https://console.cloud.google.com/sql/instances
2. Click on `book-landing-db`
3. Click "DATABASES" tab
4. Click "CREATE DATABASE"
   - Database name: `app`
   - Click "CREATE"
5. Click "USERS" tab
6. Click "ADD USER ACCOUNT"
   - User name: `bookuser`
   - Password: (create a secure password and save it)
   - Click "ADD"

**Save this password!** You'll need it in the next steps.

---

## Step 3: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Search for and enable these APIs (click "ENABLE" on each):
   - **Cloud Run API**
   - **Cloud Build API**
   - **Artifact Registry API**

---

## Step 4: Create Artifact Registry Repository

1. Go to: https://console.cloud.google.com/artifacts
2. Click "CREATE REPOSITORY"
3. Configure:
   - Name: `book-landing-repo`
   - Format: **Docker**
   - Location type: **Region**
   - Region: `us-central1` (or same as your Cloud SQL)
4. Click "CREATE"

---

## Step 5: Build and Push Docker Image (Using Cloud Build)

Since we're using the web console, we'll use Cloud Build to build our image:

### Option A: Using GitHub (Recommended)

1. Push your code to GitHub (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to: https://console.cloud.google.com/cloud-build/triggers
3. Click "CONNECT REPOSITORY"
4. Select "GitHub" → Authenticate → Select your repository
5. Click "CREATE TRIGGER"
   - Name: `deploy-book-landing`
   - Event: Manual invocation
   - Source: Your repository
   - Configuration: Cloud Build configuration file (yaml or json)
   - Cloud Build configuration file location: `/cloudbuild.yaml`
6. Click "CREATE"

### Option B: Upload ZIP and Build

If you don't want to use GitHub:

1. Create a ZIP of your project (exclude `node_modules`)
2. Go to: https://console.cloud.google.com/cloud-build/builds
3. We'll use Cloud Shell instead - click the terminal icon (>_) in the top right
4. In Cloud Shell, run:
   ```bash
   # Upload your code
   # You can drag and drop the ZIP file into Cloud Shell

   # Unzip
   unzip book-landing-page.zip
   cd book-landing-page

   # Build and push
   gcloud builds submit --tag us-central1-docker.pkg.dev/book-landing-page/book-landing-repo/book-landing-page:latest
   ```

---

## Step 6: Deploy to Cloud Run

1. Go to: https://console.cloud.google.com/run
2. Click "CREATE SERVICE"
3. Configure:
   - **Container image URL**: Click "SELECT" → Browse to:
     `us-central1-docker.pkg.dev/book-landing-page/book-landing-repo/book-landing-page:latest`
   - **Service name**: `book-landing-page`
   - **Region**: `us-central1` (same as database)
   - **Authentication**: Allow unauthenticated invocations ✅

4. Click "CONTAINER, VARIABLES & SECRETS, CONNECTIONS, SECURITY"
5. Under "VARIABLES & SECRETS" tab:
   - Click "ADD VARIABLE"
   - Add these environment variables:

   | Name | Value |
   |------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `8080` |
   | `HOST` | `0.0.0.0` |
   | `APP_KEY` | `aI2pduWLRwtVw5lALD5SLg3KbO+TxAEWzRs3FYkWTfE=` |
   | `DB_HOST` | `/cloudsql/book-landing-page:us-central1:book-landing-db` |
   | `DB_PORT` | `5432` |
   | `DB_USER` | `bookuser` |
   | `DB_PASSWORD` | [Your bookuser password] |
   | `DB_DATABASE` | `app` |

6. Under "CONNECTIONS" tab:
   - Click "ADD CONNECTION"
   - Select "Cloud SQL connections"
   - Select your instance: `book-landing-db`

7. Under "CONTAINER" tab:
   - Container port: `8080`
   - Memory: `512 MiB`
   - CPU: `1`
   - Maximum instances: `5`
   - Minimum instances: `0` (or `1` if you want it always running)

8. Click "CREATE"

---

## Step 7: Wait for Deployment

The deployment takes 2-5 minutes. You'll see:
- ✅ Deploying...
- ✅ Routing traffic...
- ✅ Service deployed

Once complete, you'll get a URL like:
`https://book-landing-page-XXXXX-uc.a.run.app`

---

## Step 8: Access Your Application

1. Click the URL from Cloud Run
2. You should see your Book Landing Page!
3. Go to `/login` to access the admin panel
4. Login with: `admin@example.com` / `password123`

---

## Troubleshooting

### If you get a 500 error:

1. Go to Cloud Run service
2. Click "LOGS" tab
3. Look for errors related to:
   - Database connection (check DB credentials)
   - Migrations (should run automatically)

### If migrations didn't run:

1. Go to Cloud Run service
2. Click "REVISIONS" tab
3. Click the three dots → "Execute command"
4. Run: `node ace migration:run --force`

---

## Next Steps

1. **Change admin password** - Login and update the admin user
2. **Create content** - Add your book sections via admin panel
3. **Test QR code** - The QR code will automatically show your production URL
4. **(Optional) Add custom domain** - Go to Cloud Run → "MANAGE CUSTOM DOMAINS"

---

## Costs

Estimated monthly cost:
- Cloud Run: $0-5 (generous free tier)
- Cloud SQL: $7-10
- **Total: ~$7-15/month**

---

## Security Recommendations

- [ ] Change the default admin password immediately
- [ ] Consider using Secret Manager instead of environment variables for passwords
- [ ] Enable Cloud SQL automatic backups
- [ ] Set up Cloud Monitoring alerts
