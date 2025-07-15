# Fix for Next.js "Operation not permitted" error

The issue is caused by Angular CLI interfering with Node.js execution. Here are the solutions:

## Solution 1: Temporarily disable Angular CLI
```bash
# Check what's in your .zshrc file
cat ~/.zshrc | grep ng

# Comment out the ng command line (around line 10)
# Edit ~/.zshrc and comment out or remove the ng alias/function
```

## Solution 2: Use direct Node.js execution
```bash
# Navigate to your project
cd /Users/dmarinangeli/Documents/Projects/Nutrizio

# Run Next.js directly with the full node path
/Users/dmarinangeli/.nvm/versions/node/v22.11.0/bin/node ./node_modules/next/dist/bin/next dev

# Or use the existing script
chmod +x start-dev.sh
./start-dev.sh
```

## Solution 3: Create a new terminal session
```bash
# Open a new terminal window/tab
# Navigate to project directory
cd /Users/dmarinangeli/Documents/Projects/Nutrizio

# Try npm run dev again
npm run dev
```

## Solution 4: Use yarn instead of npm
```bash
# Install yarn if you don't have it
npm install -g yarn

# Run with yarn
yarn dev
```

The project code is ready and all TypeScript issues have been fixed. The only remaining issue is running the development server due to the Angular CLI interference.
