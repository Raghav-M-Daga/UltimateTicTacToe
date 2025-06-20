# Ultimate Tic Tac Toe 🎮

A modern, full-featured implementation of Ultimate Tic Tac Toe built with Next.js, React, TypeScript, and Firebase. Play against AI, friends locally, or compete online in real-time multiplayer matches.

![Ultimate Tic Tac Toe](https://img.shields.io/badge/Game-Ultimate%20Tic%20Tac%20Toe-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-10-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC)

## 🎯 Overview

Ultimate Tic Tac Toe is a strategic variant of the classic game where players compete on a 3x3 grid of mini-boards. Each move determines where your opponent must play next, adding layers of strategy and forward-thinking to the traditional game.

### Key Features

- **🎮 Three Game Modes**: Single Player (AI), Local Multiplayer, Online Multiplayer
- **🌐 Real-time Online Play**: Play with friends anywhere in the world
- **🤖 Smart AI**: Challenging AI opponent with strategic gameplay
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Beautiful animations and intuitive interface
- **🔐 User Authentication**: Secure login with Google and email/password
- **📊 Game Statistics**: Track your progress and performance

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ultimate-tic-tac-toe.git
   cd ultimate-tic-tac-toe
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google and Email/Password)
   - Enable Realtime Database
   - Copy your Firebase config

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

### Game Rules

1. **Objective**: Win three mini-boards in a row (horizontally, vertically, or diagonally)

2. **Basic Rules**:
   - The game consists of 9 mini-boards arranged in a 3x3 grid
   - Players take turns placing X or O in any empty cell
   - The first player to get three in a row in any mini-board wins that board
   - Once a mini-board is won, it cannot be played in again

3. **Forced Move Rule**:
   - Your move determines where your opponent must play next
   - If you play in cell 5 of mini-board 2, your opponent must play in mini-board 5
   - If the target mini-board is already won or full, your opponent can play anywhere
   - On the first move, you can play anywhere on any board

4. **Winning Conditions**:
   - Win three mini-boards in a row (like regular tic-tac-toe)
   - The three winning mini-boards can be horizontal, vertical, or diagonal
   - If all mini-boards are filled without a winner, the game is a draw

### Game Modes

#### 🎯 Single Player
- Play against an intelligent AI opponent
- AI uses strategic algorithms to provide a challenging experience
- Perfect for practice and improving your skills

#### 👥 Local Multiplayer
- Play with a friend on the same device
- Take turns using the same screen
- Great for quick games and family fun

#### 🌐 Online Multiplayer
- Create or join games with friends online
- Real-time synchronization using Firebase
- Share game IDs to invite friends
- Features include:
  - Real-time move updates
  - Turn indicators
  - Board highlighting
  - Last move highlighting
  - Reset game functionality
  - Copy game ID button

## 🏗️ Project Structure

```
ultimate-tic-tac-toe/
├── app/
│   ├── components/
│   │   ├── AuthProvider.tsx      # Authentication context
│   │   ├── ProtectedRoute.tsx    # Route protection
│   │   └── UltimateTicTacToe.tsx # Main game component
│   ├── games/
│   │   ├── local/
│   │   │   └── page.tsx          # Local multiplayer page
│   │   ├── online/
│   │   │   └── page.tsx          # Online multiplayer page
│   │   ├── single/
│   │   │   └── page.tsx          # Single player page
│   │   └── page.tsx              # Game mode selection
│   ├── firebaseConfig.ts         # Firebase configuration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── public/                       # Static assets
├── README.md                     # This file
├── package.json                  # Dependencies
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🛠️ Technologies Used

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks and modern features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions

### Backend & Services
- **Firebase Authentication**: User management and security
- **Firebase Realtime Database**: Real-time data synchronization
- **Firebase Hosting**: Production deployment (optional)

### Development Tools
- **ESLint**: Code linting and quality
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🎨 Features & UI Elements

### Visual Design
- **Dark Theme**: Easy on the eyes with high contrast
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: Framer Motion powered transitions
- **Color-coded Elements**: X (red), O (blue), highlights (green/yellow)

### Game Interface
- **Board Highlighting**: Shows which board is currently active
- **Last Move Indicator**: Yellow highlight with white border
- **Turn Indicators**: Clear visual feedback for whose turn it is
- **Player Identification**: Shows which symbol you are playing as
- **Game Status**: Displays current game state and winner

### Online Features
- **Real-time Updates**: Instant synchronization between players
- **Game ID Sharing**: Easy way to invite friends
- **Reset Functionality**: Collaborative game reset with confirmation
- **Move Validation**: Prevents illegal moves and ensures fair play

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Game Concept**: Ultimate Tic Tac Toe is a well-known strategic variant
- **Firebase**: For providing excellent real-time database and authentication services
- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ultimate-tic-tac-toe/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide your browser and device information

## 🎯 Roadmap

### Planned Features
- [ ] Game history and statistics
- [ ] Tournament mode
- [ ] Custom themes and colors
- [ ] Sound effects and music
- [ ] Mobile app (React Native)
- [ ] AI difficulty levels
- [ ] Spectator mode for online games
- [ ] Chat functionality for online games

### Performance Improvements
- [ ] Optimize bundle size
- [ ] Implement service workers for offline play
- [ ] Add progressive web app features
- [ ] Improve AI algorithm efficiency

---

**Enjoy playing Ultimate Tic Tac Toe! 🎮✨**

*Built with ❤️ using Next.js, React, TypeScript, and Firebase*
