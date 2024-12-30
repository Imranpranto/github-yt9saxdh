# macOS Development Environment Setup Guide

## Prerequisites

### System Requirements
- macOS 11 (Big Sur) or later
- At least 8GB RAM (16GB recommended)
- 20GB free disk space
- Admin user access

## Initial Setup

### 1. Install Command Line Tools
```bash
xcode-select --install
```

### 2. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Add Homebrew to your PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Install Development Tools
```bash
# Install Node.js
brew install node@20

# Install Git
brew install git

# Install Docker Desktop
brew install --cask docker

# Install Supabase CLI
brew install supabase/tap/supabase
```

## Project Setup

### 1. Configure Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

Add to SSH agent:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 3. Project Environment Setup
```bash
# Create project directory
mkdir ~/Projects
cd ~/Projects

# Clone project repository
git clone <repository-url>
cd <project-name>

# Install dependencies
npm install
```

## Supabase Edge Functions Setup

### 1. Configure Supabase CLI
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref wttwdqxijxvzylavmsrw
```

### 2. Deploy Edge Functions
```bash
# Deploy individual functions
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
```

### 3. Environment Configuration
Create `.env` file in project root:
```bash
cat << EOF > .env
STRIPE_SECRET_KEY=sk_test_51PJI3VClmigcXiKNHGrch1mXimsi9UWhiJxkdR35jWPaq4NQcZtJFv5prRWIlzHZeBkdw9M0P2DBPROwpXAdZGaH004k63xjbr
STRIPE_WEBHOOK_SECRET=whsec_H1SxFgiGZvEK5UKHZvd4iaffAdYZohe3
EOF
```

## Development Workflow

### 1. Start Local Development
```bash
# Start Docker Desktop
open -a Docker

# Start Supabase services
supabase start

# Start development server
npm run dev
```

### 2. Testing Edge Functions Locally
```bash
# Serve functions locally
supabase functions serve

# Test webhook endpoint
curl -i --location --request POST 'http://localhost:54321/functions/v1/stripe-webhook' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Conflicts
If you encounter port conflicts:
```bash
# Find process using port
sudo lsof -i :5432
# Kill process
kill -9 <PID>
```

#### 2. Docker Issues
```bash
# Reset Docker Desktop
killall Docker && open -a Docker
```

#### 3. Node Version Conflicts
```bash
# Install nvm
brew install nvm

# Install and use correct Node version
nvm install 20
nvm use 20
```

#### 4. Supabase CLI Issues
```bash
# Reset Supabase
supabase stop
rm -rf ~/.supabase
supabase start
```

## Performance Optimization

### 1. System Resources
```bash
# Clear DNS cache
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Clear system cache
sudo purge
```

### 2. Development Tools
```bash
# Clear npm cache
npm cache clean --force

# Clear Homebrew cache
brew cleanup
```

## Security Best Practices

### 1. FileVault Encryption
Enable FileVault in System Preferences > Security & Privacy

### 2. Firewall Configuration
```bash
# Enable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

### 3. Secure Environment Variables
Use `direnv` for environment management:
```bash
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
```

## Maintenance

### Regular Updates
```bash
# Update Homebrew and packages
brew update && brew upgrade

# Update npm packages
npm update

# Update Supabase CLI
brew upgrade supabase
```

### Cleanup
```bash
# Remove old Node modules
npm prune

# Clean Docker
docker system prune -a

# Clear temporary files
rm -rf ~/Library/Caches/*
```

## IDE Setup (VS Code)

### 1. Installation
```bash
brew install --cask visual-studio-code
```

### 2. Essential Extensions
- ESLint
- Prettier
- GitLens
- Supabase
- Docker
- TypeScript and JavaScript Language Features

### 3. Settings Configuration
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

## Version Control

### Git Configuration
```bash
# Create .gitignore
cat << EOF > .gitignore
node_modules/
.env
.env.*
.DS_Store
dist/
*.log
EOF
```

## Additional Resources

- [Official Supabase Documentation](https://supabase.io/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Docker Desktop Documentation](https://docs.docker.com/desktop/mac/)
- [Homebrew Documentation](https://docs.brew.sh)

## Support

For additional support:
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: [Project Issues Page]
- Stack Overflow: Tag questions with `supabase` and `macos`