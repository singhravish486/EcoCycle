# 🌱 Eco Cycle - Smart Recycling Platform

A Next.js web application that gamifies recycling and promotes environmental sustainability through rewards, challenges, and AI assistance.

## ✨ Features

- 🎯 **Gamification System** - Earn R coins and points for recycling
- 📍 **Smart Hub Locator** - Find nearest recycling centers with Google Maps
- 📱 **QR Code Scanner** - Scan hubs to log recycling activities
- 🤖 **AI Chatbot** - Get recycling tips in multiple languages (English, Hindi, Kannada)
- 🏆 **Challenges & Rewards** - Complete daily/weekly/monthly challenges
- 🎁 **Reward Redemption** - Exchange R coins for gift cards and vouchers
- 📊 **Activity Tracking** - Monitor your recycling history and impact
- 🔒 **Secure Authentication** - Powered by Supabase

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Maps:** Google Maps API
- **AI:** Google Gemini API
- **Animations:** Framer Motion
- **QR Scanner:** react-zxing
- **Deployment:** Vercel

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/eco-cycle.git
cd eco-cycle

# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## 📱 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/eco-cycle)

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the SQL scripts in order:
   - `database-schema.sql` - Creates tables
   - `fix-rls-policies.sql` - Sets up security
   - `import-all-data.sql` - Imports recycling hubs
   - `storage-policies.sql` - Sets up avatar storage

3. Create `avatars` storage bucket (public)

## 🎮 How to Use

1. **Sign Up** - Create your account
2. **Find Hubs** - Locate nearby recycling centers
3. **Scan QR** - Visit a hub and scan the QR code
4. **Log Items** - Record what you recycled
5. **Earn Rewards** - Get R coins and points
6. **Complete Challenges** - Daily, weekly, monthly tasks
7. **Redeem Rewards** - Exchange coins for prizes

## 🌟 Key Features Explained

### Gamification System
- **R Coins:** Virtual currency earned by recycling
- **Points:** XP system for leveling up
- **Levels:** Beginner → Intermediate → Advanced → Expert
- **Streaks:** Consecutive days of recycling

### Challenge System
- **Daily:** Recycle 3 plastic bottles
- **Weekly:** Visit 2 different hubs
- **Monthly:** Recycle 50 items total

### Reward Catalog
- Amazon Gift Cards (₹100, ₹500)
- Zomato Vouchers (₹50 off)
- Flipkart Gift Cards (₹75)
- And more!

## 📊 Project Structure

```
eco-cycle/
├── src/
│   ├── app/
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Main dashboard
│   │   └── api/           # API routes (Gemini chatbot)
│   ├── components/
│   │   ├── MapSection.tsx      # Google Maps integration
│   │   ├── QRScanner.tsx       # QR code scanner
│   │   ├── GeminiChatbot.tsx   # AI assistant
│   │   └── ...
│   └── lib/
│       ├── supabase.ts    # Supabase client
│       └── config.ts      # Configuration
├── public/                # Static assets
├── DEPLOYMENT.md          # Deployment guide
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Maps for location services
- Supabase for backend infrastructure
- Google Gemini for AI capabilities
- Vercel for hosting

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with 💚 for a sustainable future**
