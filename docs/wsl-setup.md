# WSL Setup Guide for Supabase Edge Functions

## Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Supabase CLI
npm install -g supabase

# Install Docker (required for local development)
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER

# Log out and log back in for Docker permissions to take effect
```

## Project Setup
```bash
# Navigate to your project directory (replace with your actual path)
cd /mnt/c/Users/your-username/your-project

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref wttwdqxijxvzylavmsrw

# Deploy functions
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
```

## Environment Variables
Create a `.env` file in your project root:
```bash
echo "STRIPE_SECRET_KEY=sk_test_51PJI3VClmigcXiKNHGrch1mXimsi9UWhiJxkdR35jWPaq4NQcZtJFv5prRWIlzHZeBkdw9M0P2DBPROwpXAdZGaH004k63xjbr" >> .env
echo "STRIPE_WEBHOOK_SECRET=whsec_H1SxFgiGZvEK5UKHZvd4iaffAdYZohe3" >> .env
```

## Verify Deployment
After deploying, your functions will be available at:
```
https://wttwdqxijxvzylavmsrw.functions.supabase.co/stripe-webhook
https://wttwdqxijxvzylavmsrw.functions.supabase.co/create-checkout-session
https://wttwdqxijxvzylavmsrw.functions.supabase.co/create-portal-session
```

## Testing Functions Locally
```bash
# Start local development
supabase start
supabase functions serve

# Test webhook endpoint
curl -i --location --request POST 'http://localhost:54321/functions/v1/stripe-webhook' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

## Troubleshooting
If you encounter any issues:

1. Verify Docker is running:
```bash
docker ps
```

2. Check Supabase CLI version:
```bash
supabase --version
```

3. Verify project linking:
```bash
supabase status
```

4. Check function logs:
```bash
supabase functions logs stripe-webhook
```