# BitArt Market - NFT Marketplace on Stacks Blockchain

A comprehensive, production-ready NFT marketplace built on the Stacks blockchain with Clarity smart contracts, React frontend, and Node.js backend.

## 🚀 Features

### Smart Contracts
- **SFT-based NFTs** with metadata storage
- **Royalty system** for creator earnings on resales
- **Marketplace listing** with price management
- **Post-conditions** for transaction security
- **Admin role** for platform management
- **Secure auction system** with bid tracking

### Frontend
- **Responsive design** (mobile, tablet, desktop)
- **Dark/Light mode** support
- **Real-time blockchain data** display
- **Wallet integration** (Leather, Hiro)
- **NFT discovery** with advanced filters and search
- **Creator Studio** for artists to manage collections
- **Smooth animations** and transitions

### Backend
- **REST API** for metadata and analytics
- **IPFS integration** for decentralized storage
- **User profile management**
- **Transaction history tracking**
- **Search and filtering** engine

### Multi-Chain Support (New)
- **Stacks**: Primary marketplace and smart contracts
- **Celo (Alfajores by default)**: Wallet connect, RPC health, and balance visibility
- Chain selector in the header to switch between Stacks and Celo

## 📋 Project Structure

```
/contracts        → Clarity smart contracts
/frontend         → React UI application
/backend          → Node.js/Express API
/config           → Network & environment configuration
/utils            → Web3 helpers and utilities
/docs             → Documentation
```

## ⚙️ Prerequisites

- Node.js 16+
- Stacks.js v4+
- Clarinet (for contract development)
- IPFS node or Pinata account (for image storage)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bitart-market.git
cd bitart-market

# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspace backend
npm install --workspace frontend

# Install contracts dependencies
cd contracts && npm install && cd ..
```

## 🚀 Getting Started

### 1. Configure Environment Variables

Create `.env.local` files:

**Backend** (`backend/.env.local`):
```
PORT=3001
NETWORK=testnet
STACKS_API_URL=https://api.testnet.stacks.co
IPFS_GATEWAY=https://gateway.pinata.cloud
PINATA_JWT=your_pinata_jwt_token
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

**Frontend** (`frontend/.env.local`):
```
VITE_NETWORK=testnet
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
VITE_CELO_CHAIN_ID=0xaef3
VITE_CELO_CHAIN_NAME="Celo Alfajores Testnet"
VITE_CELO_CURRENCY=CELO
VITE_CELO_EXPLORER=https://alfajores-blockscout.celo-testnet.org
```

### 2. Deploy Smart Contracts

```bash
cd contracts

# Test contracts
npm run test

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet (after testing)
npm run deploy:mainnet
```

See [CONTRACTS.md](./docs/CONTRACTS.md) for detailed contract documentation.

### 3. Start Backend

```bash
npm run dev --workspace backend
```

The API will be available at `http://localhost:3001`

### 4. Start Frontend

```bash
npm run dev --workspace frontend
```

The app will be available at `http://localhost:5173`

### 5. Create Your First NFT

1. Connect your wallet (Leather or Hiro)
2. Navigate to "Create" → "New NFT"
3. Upload artwork and fill metadata
4. Set royalty percentage (0-25%)
5. Click "Mint NFT"
6. Approve transaction in wallet

## 📚 Documentation

- **[Smart Contracts](./docs/CONTRACTS.md)** - Clarity contract details, functions, and safety
- **[API Reference](./docs/API.md)** - Backend endpoints and data models
- **[Wallet Integration](./docs/WALLET.md)** - Stacks.js setup and wallet connection
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment steps
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and data flow

## 🔐 Security Features

- **Post-conditions** on all marketplace transactions
- **Admin verification** for sensitive operations
- **Input validation** on all contract functions
- **Rate limiting** on API endpoints
- **Image hash verification** to prevent duplicates
- **Secure wallet connection** with signing validation

## 📊 API Endpoints

### NFTs
- `GET /api/nfts` - List all NFTs with filters
- `GET /api/nfts/:id` - Get NFT details
- `POST /api/nfts` - Create NFT (authenticated)
- `GET /api/nfts/:id/history` - Transaction history

### Marketplace
- `GET /api/marketplace/listings` - Active listings
- `POST /api/marketplace/listings` - Create listing
- `PUT /api/marketplace/listings/:id` - Update listing
- `DELETE /api/marketplace/listings/:id` - Cancel listing

### Users
- `GET /api/users/:address` - User profile
- `GET /api/users/:address/nfts` - User's NFTs
- `GET /api/users/:address/collections` - User's collections
- `POST /api/users/:address/avatar` - Upload avatar

### Analytics
- `GET /api/analytics/stats` - Marketplace statistics
- `GET /api/analytics/top-creators` - Top creators by volume
- `GET /api/analytics/top-buyers` - Top buyers by spending

## 🎨 UI/UX Components

### Pages
- **Homepage** - Trending, newest, featured NFTs
- **Discover** - Search, filters, categories
- **Create** - Minting interface
- **NFT Detail** - Full NFT information with history
- **Profile** - User portfolio and owned NFTs
- **Creator Studio** - Sales tracking and collection management
- **Marketplace** - All active listings with advanced filters

### Features
- Dark/Light mode toggle
- Real-time notifications
- Responsive design
- Favorite/bookmark system
- Advanced search with autocomplete
- Category and tag filters
- Price range slider
- Sorting options (price, date, popularity)

## 🧪 Testing

```bash
# Test contracts
cd contracts && npm run test

# Test backend
npm run test --workspace backend

# Test frontend
npm run test --workspace frontend
```

## 🚢 Deployment

### Quick Start Deployment

We provide deployment configurations for Render (backend) and Vercel (frontend).

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.**

#### Backend (Node.js/Express on Render)
```bash
# Verify build
npm run build --workspace backend

# Push to GitHub
git push origin main

# On Render.com:
# 1. Connect GitHub repository
# 2. Deploy script: npm run build --workspace backend
# 3. Start command: node backend/dist/index.js
# 4. Set environment variables (see .env.production.backend)
```

#### Frontend (React/Vite on Vercel)
```bash
# Verify build
npm run build --workspace frontend

# Option 1: Vercel CLI
npm install -g vercel
vercel --prod

# Option 2: GitHub integration on Vercel.com
# Connect repository and auto-deploy on push
```

### Environment Variables

**Backend (.env.production.backend)**
```
NODE_ENV=production
STACKS_API_URL=https://api.mainnet.stacks.co
STACKS_NETWORK=mainnet
CELO_RPC_URL=https://forno.celo.org
PINATA_API_KEY=your_key
PINATA_SECRET_API_KEY=your_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend (.env.production.frontend)**
```
VITE_API_URL=https://your-backend-api.com
VITE_STACKS_API_URL=https://api.mainnet.stacks.co
VITE_STACKS_NETWORK=mainnet
VITE_CELO_RPC_URL=https://forno.celo.org
```

### Production URLs (After Deployment)
- **Frontend**: https://bitart-market.vercel.app (example)
- **Backend API**: https://bitart-market-api.onrender.com (example)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:**
- Setting up Render for backend
- Configuring Vercel for frontend
- Environment variable management
- Monitoring and maintenance
- Alternative hosting options

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🔗 Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language](https://clarity-lang.org/)
- [Stacks.js](https://stacks.js.org/)
- [IPFS](https://ipfs.io/)
- [Pinata](https://www.pinata.cloud/)

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Join the [Stacks Discord](https://discord.com/invite/stacks)
- Check the [documentation](./docs/)

---

**Built with ❤️ for the Stacks community**
