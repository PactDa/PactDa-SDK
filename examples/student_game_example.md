# 🎮 Student Gaming Example - Build Your First Wagered Fighting Game

## Overview
This example shows how students can use the **PactDa Gaming SDK** to create a simple fighting game with wagering mechanics in just a few steps!

## 🚀 Quick Start - 5 Minutes to Fighting Game

### Step 1: Create Your Game
```typescript
// Create a new fighting game
await pactdaGaming.createGame({
    gameType: "PVP_BATTLE",
    title: "Epic Ninja Battle",
    rules: "Best of 3 rounds, winner takes all!",
    wagerAmount: 1000000000, // 1 SUI in nanoSUI
    maxPlayers: 2,
    timeoutDuration: 300000, // 5 minutes
});
```

### Step 2: Players Join with Wagers
```typescript
// Player 1 joins
await pactdaGaming.joinGame({
    gameId: "game_123",
    username: "NinjaWarrior",
    // SDK automatically locks wager from player's wallet
});

// Player 2 joins
await pactdaGaming.joinGame({
    gameId: "game_123", 
    username: "DragonMaster",
    // Game auto-starts when full!
});
```

### Step 3: Fight & Determine Winner
```typescript
// Your game logic here - could be:
// - Turn-based combat
// - Real-time fighting
// - Rock-paper-scissors
// - Card battle
// - Any game mechanics you want!

// When fight ends, declare winner
await pactdaGaming.finishGame({
    gameId: "game_123",
    winner: "0x...ninja_warrior_address",
    gameDuration: 180000, // 3 minutes
});
```

### Step 4: Winner Claims Prize
```typescript
// Winner automatically gets both wagers!
await pactdaGaming.claimPrize({
    gameId: "game_123",
    // SDK handles all the asset transfers
});
```

## 🎯 Real Game Examples Students Can Build

### 1. **Rock Paper Scissors Battle**
```typescript
const game = {
    title: "RPS Championship",
    rules: "Best of 5, 10 second rounds",
    wager: 0.5, // SUI
    maxPlayers: 2
};
```

### 2. **Turn-Based Strategy**
```typescript
const game = {
    title: "Chess Masters",
    rules: "Standard chess, 10min per player",
    wager: 2.0, // SUI
    maxPlayers: 2
};
```

### 3. **Card Battle Arena**
```typescript
const game = {
    title: "Magic Card Duel",
    rules: "30 card deck, first to 0 HP loses",
    wager: 1.0, // SUI
    maxPlayers: 2
};
```

### 4. **Team Battle Royale**
```typescript
const game = {
    title: "Squad Wars",
    rules: "3v3 team battle, last team standing",
    wager: 0.5, // SUI per player
    maxPlayers: 6
};
```

## 🏆 Tournament Mode

### Create Tournament
```typescript
await pactdaGaming.createTournament({
    title: "Weekly Fighting Championship",
    entryFee: 1.0, // SUI
    maxParticipants: 16,
    prizeDistribution: [50, 30, 20], // 1st, 2nd, 3rd place %
});
```

## 📊 Built-in Features (No Extra Code Needed!)

### ✅ **Automatic Wagering**
- Players deposit SUI into wallets
- Wagers automatically locked during games
- Winner gets all locked funds
- Losers' funds transferred to winner

### ✅ **Real-time Events**
```typescript
// Listen to game events
pactdaGaming.onGameCreated((game) => {
    console.log(`New game: ${game.title}`);
});

pactdaGaming.onPlayerJoined((player) => {
    console.log(`${player.username} joined!`);
});

pactdaGaming.onGameFinished((result) => {
    console.log(`Winner: ${result.winner}`);
});
```

### ✅ **Player Profiles & Stats**
- Automatic win/loss tracking
- Player levels and rankings
- Total winnings history
- Reputation scores

### ✅ **Security Features**
- Automatic fund escrow
- Multi-signature support
- Emergency pause functionality
- Dispute resolution system

## 🎮 Game Development Tips

### 1. **Keep It Simple**
Start with basic games like:
- Coin flip
- Number guessing
- Tic-tac-toe
- Rock-paper-scissors

### 2. **Add Game Logic**
Focus on your game mechanics:
```typescript
// Example: Simple coin flip game
function playCoinFlip(playerGuess: 'heads' | 'tails') {
    const result = Math.random() > 0.5 ? 'heads' : 'tails';
    const winner = result === playerGuess ? player1 : player2;
    
    // PactDa handles the rest!
    return pactdaGaming.finishGame(gameId, winner);
}
```

### 3. **Use Events for UI**
```typescript
// Update your game UI based on events
pactdaGaming.onGameStarted(() => {
    showGameScreen();
    startGameTimer();
});

pactdaGaming.onGameFinished((result) => {
    showWinnerScreen(result.winner);
    updatePlayerStats();
});
```

## 🎯 What Students Learn

1. **Blockchain Basics** - Without complexity
2. **Smart Contract Integration** - Through simple SDK calls  
3. **Event-Driven Programming** - Real-time game updates
4. **Financial Mechanics** - Wagering, escrow, payments
5. **Game Development** - Focus on fun, not blockchain complexity

## 🚀 Getting Started

1. **Install PactDa Gaming SDK**
```bash
npm install @pactda/gaming-sdk
```

2. **Initialize in Your Game**
```typescript
import { PactDaGaming } from '@pactda/gaming-sdk';

const gaming = new PactDaGaming({
    network: 'testnet', // Start with testnet
    apiKey: 'your-api-key'
});
```

3. **Start Building!**
Your students can focus on game mechanics while PactDa handles:
- ✅ Wallet management
- ✅ Asset transfers  
- ✅ Smart contracts
- ✅ Security
- ✅ Events
- ✅ Player profiles

## 🎊 Result: Students Build Real Games in Hours, Not Weeks!

The PactDa Gaming SDK makes blockchain gaming accessible to students without requiring deep blockchain knowledge. They can focus on creativity and game design while the SDK handles all the complex financial and security aspects.

Perfect for:
- **Coding Bootcamps**
- **University Projects** 
- **Hackathons**
- **Game Development Courses**
- **Blockchain Education** 