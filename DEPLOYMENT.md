# Deployment Guide - Book Landing Page

This guide will help you deploy the Book Landing Page application to Google Cloud Run with Cloud SQL (PostgreSQL).

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed ([Download here](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed locally
4. **Git** repository (optional but recommended)

## Step 1: Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create book-landing-page-PROJECT_ID
gcloud config set project book-landing-page-PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## Step 2: Set Up Cloud SQL (PostgreSQL)

```bash
# Create PostgreSQL instance
gcloud sql instances create book-landing-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_ROOT_PASSWORD

# Create database
gcloud sql databases create app --instance=book-landing-db

# Create user
gcloud sql users create bookuser \
  --instance=book-landing-db \
  --password=YOUR_SECURE_USER_PASSWORD
```

## Step 3: Set Up Secrets in Secret Manager

```bash
# Generate APP_KEY (use this command or generate a 32-character random string)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Store secrets
echo -n "YOUR_GENERATED_APP_KEY" | gcloud secrets create app-key --data-file=-
echo -n "book-landing-db" | gcloud secrets create db-host --data-file=-
echo -n "bookuser" | gcloud secrets create db-user --data-file=-
echo -n "YOUR_SECURE_USER_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "app" | gcloud secrets create db-database --data-file=-
```

## Step 4: Build and Deploy Application

```bash
# Build Docker image using Cloud Build
gcloud builds submit --tag gcr.io/PROJECT_ID/book-landing-page

# Deploy to Cloud Run with Cloud SQL connection
gcloud run deploy book-landing-page \
  --image gcr.io/PROJECT_ID/book-landing-page \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:us-central1:book-landing-db \
  --set-env-vars NODE_ENV=production,PORT=8080,HOST=0.0.0.0 \
  --set-secrets APP_KEY=app-key:latest,DB_HOST=db-host:latest,DB_USER=db-user:latest,DB_PASSWORD=db-password:latest,DB_DATABASE=db-database:latest \
  --max-instances 5 \
  --min-instances 1 \
  --memory 512Mi \
  --cpu 1
```

## Step 5: Configure Environment for Cloud SQL

Update your `.env.production` (or configure via Cloud Run console):

```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database - Cloud SQL (using Unix socket)
DB_CONNECTION=pg
DB_HOST=/cloudsql/PROJECT_ID:us-central1:book-landing-db
DB_PORT=5432
DB_USER=bookuser
DB_PASSWORD=YOUR_SECURE_USER_PASSWORD
DB_DATABASE=app

# Session
SESSION_DRIVER=cookie

# App Key (32 characters base64)
APP_KEY=YOUR_GENERATED_APP_KEY
```

## Step 6: Run Initial Setup

After deployment, you'll need to:

1. **Run migrations** (happens automatically on container start via CMD in Dockerfile)
2. **Seed initial admin user**:
   ```bash
   # Connect to Cloud Run instance and run seeder
   gcloud run services proxy book-landing-page --region=us-central1
   # In another terminal:
   curl -X POST http://localhost:8080/setup
   ```

   Or create admin user manually via Cloud SQL:
   ```bash
   gcloud sql connect book-landing-db --user=bookuser
   # Run SQL to insert admin user
   ```

## Step 7: Get Your Deployment URL

```bash
# Get the Cloud Run service URL
gcloud run services describe book-landing-page \
  --region us-central1 \
  --format 'value(status.url)'
```

Your application will be available at: `https://book-landing-page-XXXXX-uc.a.run.app`

## Step 8: Set Up Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service book-landing-page \
  --domain your-book-domain.com \
  --region us-central1
```

Then update your DNS records as instructed by Google Cloud.

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `8080` |
| `HOST` | Server host | `0.0.0.0` |
| `DB_HOST` | Database host (Unix socket for Cloud SQL) | `/cloudsql/PROJECT_ID:REGION:INSTANCE` |
| `DB_PORT` | Database port | `5432` |
| `DB_USER` | Database user | `bookuser` |
| `DB_PASSWORD` | Database password | (secure password) |
| `DB_DATABASE` | Database name | `app` |
| `APP_KEY` | Encryption key | (32-char base64 string) |

## Updating the Application

```bash
# Build new image
gcloud builds submit --tag gcr.io/PROJECT_ID/book-landing-page

# Deploy update (Cloud Run will automatically use latest image)
gcloud run deploy book-landing-page \
  --image gcr.io/PROJECT_ID/book-landing-page \
  --platform managed \
  --region us-central1
```

## Monitoring and Logs

```bash
# View logs
gcloud run services logs tail book-landing-page --region us-central1

# View metrics in Cloud Console
https://console.cloud.google.com/run/detail/us-central1/book-landing-page
```

## Cost Estimate

- **Cloud Run**: ~$0-5/month (first 2 million requests free)
- **Cloud SQL (f1-micro)**: ~$7-10/month
- **Storage/Network**: ~$1-2/month
- **Total**: ~$8-17/month for low-moderate traffic

## Security Checklist

- ✅ Use Secret Manager for sensitive data
- ✅ Enable HTTPS (automatic with Cloud Run)
- ✅ Restrict Cloud SQL to Cloud Run only
- ✅ Use strong passwords
- ✅ Enable CSRF protection (already configured)
- ✅ Regular backups of Cloud SQL
- ✅ Update dependencies regularly

## Troubleshooting

### Migrations not running
Check Cloud Run logs for migration errors. You may need to manually run:
```bash
gcloud run exec book-landing-page --region us-central1 -- node ace migration:run --force
```

### Database connection issues
Ensure Cloud SQL instance is in the same region as Cloud Run and the Cloud SQL connector is properly configured.

### 500 errors
Check Cloud Run logs:
```bash
gcloud run services logs read book-landing-page --region us-central1 --limit 50
```

## Support

For issues specific to:
- **AdonisJS**: https://docs.adonisjs.com
- **Google Cloud Run**: https://cloud.google.com/run/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs
