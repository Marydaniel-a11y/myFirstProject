import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Component for our bouncing balls game - we're extracting it to keep code organized!
function BouncingBallsGame() {
  // useRef gives us access to the container element so we can measure its size
  const containerRef = useRef(null);
  
  // useState stores the position and velocity of each ball
  // Each ball has: x, y (position), vx, vy (velocity), size, and color
  // MUCH FASTER speeds for high-energy, exciting collisions!
  // Beautiful grayscale palette for modern, minimalist design
  const [balls, setBalls] = useState([
    { id: 1, x: 100, y: 100, vx: 6.5, vy: 5.2, size: 50, color: 'linear-gradient(135deg, #6b6b6b, #4a4a4a)' }, // Medium ball, very fast
    { id: 2, x: 200, y: 150, vx: -7.8, vy: 6.1, size: 70, color: 'linear-gradient(135deg, #9e9e9e, #757575)' }, // Large ball, super fast
    { id: 3, x: 300, y: 200, vx: 5.4, vy: -7.2, size: 35, color: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)' }, // Small ball, lightning fast
    { id: 4, x: 150, y: 250, vx: -5.8, vy: -4.9, size: 80, color: 'linear-gradient(135deg, #424242, #212121)' }, // Largest ball, fast speed
    { id: 5, x: 250, y: 100, vx: 8.5, vy: 7.8, size: 40, color: 'linear-gradient(135deg, #c9c9c9, #a8a8a8)' } // Small ball, BLAZING fast!
  ]);

  // This effect runs our physics simulation
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBalls(prevBalls => {
        // Get container dimensions for wall collision detection
        const container = containerRef.current;
        if (!container) return prevBalls;
        
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        // Note: We now use individual ball sizes instead of a fixed ballSize
        
        // Create a copy of balls to modify
        let newBalls = prevBalls.map(ball => ({
          ...ball,
          x: ball.x + ball.vx, // Update position
          y: ball.y + ball.vy
        }));
        
        // Check ball-to-ball collisions FIRST
        for (let i = 0; i < newBalls.length; i++) {
          for (let j = i + 1; j < newBalls.length; j++) {
            const ball1 = newBalls[i];
            const ball2 = newBalls[j];
            
            // Calculate individual ball radii
            const radius1 = ball1.size / 2;
            const radius2 = ball2.size / 2;
            
            // Calculate distance between ball centers
            const dx = (ball1.x + radius1) - (ball2.x + radius2);
            const dy = (ball1.y + radius1) - (ball2.y + radius2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if balls are colliding (distance < sum of radii)
            if (distance < radius1 + radius2) {
              // Calculate collision response using individual ball sizes
              const angle = Math.atan2(dy, dx);
              const targetDistance = radius1 + radius2;
              const targetX = (ball1.x + radius1) + Math.cos(angle) * targetDistance;
              const targetY = (ball1.y + radius1) + Math.sin(angle) * targetDistance;
              
              // Separate the balls so they don't overlap
              const ax = (targetX - (ball2.x + radius2)) * 0.5;
              const ay = (targetY - (ball2.y + radius2)) * 0.5;
              
              ball1.x += ax;
              ball1.y += ay;
              ball2.x -= ax;
              ball2.y -= ay;
              
              // Calculate new velocities (elastic collision)
              const vx1 = ball1.vx;
              const vy1 = ball1.vy;
              const vx2 = ball2.vx;
              const vy2 = ball2.vy;
              
              // Gentler collision response - partial velocity exchange instead of full swap
              const dampening = 0.6; // How much velocity to exchange (0.6 = 60%)
              const newVx1 = ball1.vx * (1 - dampening) + ball2.vx * dampening;
              const newVy1 = ball1.vy * (1 - dampening) + ball2.vy * dampening;
              const newVx2 = ball2.vx * (1 - dampening) + ball1.vx * dampening;
              const newVy2 = ball2.vy * (1 - dampening) + ball1.vy * dampening;
              
              ball1.vx = newVx1;
              ball1.vy = newVy1;
              ball2.vx = newVx2;
              ball2.vy = newVy2;
              
              // Gentle energy dampening for smooth, realistic movement
              ball1.vx *= 0.95; // Only lose 5% energy instead of 10%
              ball1.vy *= 0.95;
              ball2.vx *= 0.95;
              ball2.vy *= 0.95;
            }
          }
        }
        
        // Now check wall collisions for each ball
        newBalls = newBalls.map(ball => {
          let newX = ball.x;
          let newY = ball.y;
          let newVx = ball.vx;
          let newVy = ball.vy;
          
          // Check collision with left and right walls - using individual ball size
          if (newX <= 0 || newX >= containerWidth - ball.size) {
            newVx = -newVx * 0.85; // Less energy loss for more dynamic bouncing
            newX = newX <= 0 ? 0 : containerWidth - ball.size; // Keep ball inside bounds
          }
          
          // Check collision with top and bottom walls - using individual ball size
          if (newY <= 0 || newY >= containerHeight - ball.size) {
            newVy = -newVy * 0.85; // Less energy loss for more dynamic bouncing
            newY = newY <= 0 ? 0 : containerHeight - ball.size; // Keep ball inside bounds
          }
          
          // Add gentle air resistance for smoother, more natural movement
          newVx *= 0.999; // Very slight air resistance (0.1% energy loss per frame)
          newVy *= 0.999;
          
          // Return updated ball with new position and velocity
          return {
            ...ball,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        });
        
        return newBalls;
      });
    }, 16); // Run animation at ~60 FPS (16ms = 1000ms/60fps)

    // Cleanup function - stops the animation when component unmounts
    return () => clearInterval(animationInterval);
  }, []); // Empty dependency array means this effect runs once when component mounts

  return (
    <div className="game-container">
      {/* This is our main container - the "big box" that holds everything */}
      <div className="ball-container" ref={containerRef}>
        <h1 className="title">⚡ Bouncing Balls</h1>
        
        {/* Render each ball with its current position and individual size */}
        {balls.map(ball => (
          <div
            key={ball.id}
            className="ball"
            style={{
              left: `${ball.x}px`, // Position from left edge
              top: `${ball.y}px`,  // Position from top edge
              width: `${ball.size}px`, // Individual ball width
              height: `${ball.size}px`, // Individual ball height
              background: ball.color, // Each ball has its own color
              transform: 'none' // Override any CSS transforms
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Pac-Man Game Component - A classic arcade game recreation!
function PacManGame() {
  // Game constants - these define our maze size and cell dimensions
  const GRID_WIDTH = 19;   // How many cells wide our maze is
  const GRID_HEIGHT = 13;  // How many cells tall our maze is
  const CELL_SIZE = 30;    // Size of each cell in pixels
  
  // Create a simple maze layout (1 = wall, 0 = path, 2 = dot)
  // This is our game map - think of it like a blueprint!
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,0,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,0,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,0,0,1,1,1,2,1,1,1,1],
    [1,2,2,2,2,1,2,2,2,0,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Game state - this tracks everything happening in our game
  const [pacmanPos, setPacmanPos] = useState({ x: 8, y: 6 }); // Start one cell left of center to avoid instant collision
  const [score, setScore] = useState(0); // Player's current score
  const [gameMap, setGameMap] = useState(maze); // Current state of the maze (walls, dots, etc.)
  const [gameOver, setGameOver] = useState(false); // Track if game is over
  
  // 👻 CREATURES STATE - Track our 3 enemy creatures
  // Each creature has x, y position and a color
  const [creatures, setCreatures] = useState([
    { id: 1, x: 9, y: 5, color: 'red' },   // Spawn in newly opened center column (upper)
    { id: 2, x: 9, y: 6, color: 'blue' },  // Spawn in newly opened center column (middle)
    { id: 3, x: 9, y: 7, color: 'green' }  // Spawn in newly opened center column (lower)
  ]);
  
  // 🤖 CREATURE AI - Make creatures move toward Pac-Man automatically
  useEffect(() => {
    // Only move creatures if game is not over
    if (gameOver) return;
    
    const moveCreatures = setInterval(() => {
      setCreatures(prevCreatures => {
        return prevCreatures.map(creature => {
          // Calculate direction to move toward Pac-Man
          let newX = creature.x;
          let newY = creature.y;
          
          // Simple AI: Move one step closer to Pac-Man
          if (pacmanPos.x > creature.x) newX += 1; // Move right toward Pac-Man
          else if (pacmanPos.x < creature.x) newX -= 1; // Move left toward Pac-Man
          
          if (pacmanPos.y > creature.y) newY += 1; // Move down toward Pac-Man  
          else if (pacmanPos.y < creature.y) newY -= 1; // Move up toward Pac-Man
          
          // Check if new position is valid (not a wall and within bounds)
          if (newY >= 0 && newY < GRID_HEIGHT && 
              newX >= 0 && newX < GRID_WIDTH && 
              gameMap[newY][newX] !== 1) { // 1 = wall, creatures can't go through walls
            return { ...creature, x: newX, y: newY };
          }
          
          // If can't move toward Pac-Man (wall blocking), stay in current position
          return creature;
        });
      });
      
      // 💥 EXTRA COLLISION CHECK - After creatures move, check if any caught Pac-Man
      setCreatures(prevCreatures => {
        const collision = prevCreatures.some(creature => 
          creature.x === pacmanPos.x && creature.y === pacmanPos.y
        );
        
        if (collision) {
          // Game Over! A creature caught Pac-Man
          setGameOver(true);
        }
        
        return prevCreatures;
      });
    }, 250); // Move creatures every 250ms (quarter second) - 2X faster than before!
    
    // Cleanup interval when component unmounts or game ends
    return () => clearInterval(moveCreatures);
  }, [pacmanPos, gameMap, gameOver]); // Re-run when Pac-Man moves, map changes, or game state changes

  // Handle keyboard input for moving Pac-Man
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Don't allow movement if game is over
      if (gameOver) return;
      
      const { key } = event;
      
      // Calculate new position based on arrow key pressed
      let newX = pacmanPos.x;
      let newY = pacmanPos.y;
      
      switch(key) {
        case 'ArrowUp':    newY -= 1; break;
        case 'ArrowDown':  newY += 1; break;
        case 'ArrowLeft':  newX -= 1; break;
        case 'ArrowRight': newX += 1; break;
        default: return; // Do nothing for other keys
      }
      
      // Check if new position is valid (not a wall and within bounds)
      if (newY >= 0 && newY < GRID_HEIGHT && 
          newX >= 0 && newX < GRID_WIDTH && 
          gameMap[newY][newX] !== 1) { // 1 = wall, can't go there
        
        // Move Pac-Man to new position
        setPacmanPos({ x: newX, y: newY });
        
        // 💥 COLLISION DETECTION - Check if Pac-Man touches any creature
        const collision = creatures.some(creature => 
          creature.x === newX && creature.y === newY
        );
        
        if (collision) {
          // Game Over! Pac-Man got caught by a creature
          setGameOver(true);
          return; // Stop processing, don't collect dots
        }
        
        // Check if there's a dot at the new position
        if (gameMap[newY][newX] === 2) { // 2 = dot
          // Collect the dot! Update score and remove dot from map
          setScore(prevScore => prevScore + 10);
          
          // Create new map with dot removed (change 2 to 0)
          const newGameMap = gameMap.map(row => [...row]); // Copy the maze
          newGameMap[newY][newX] = 0; // Remove the dot (make it empty path)
          setGameMap(newGameMap);
        }
      }
    };

    // Listen for keyboard events
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup: remove listener when component unmounts
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pacmanPos, gameMap]); // Re-run when position or map changes

  return (
    <div className="game-container">
      <div className="pacman-game-area">
        {/* Score Display */}
        <div className="score-display">Score: {score}</div>
        
        {/* Game Status Display */}
        {gameOver ? (
          <div className="game-over" style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            color: 'white',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              border: '3px solid #ff0000',
              borderRadius: '20px',
              padding: '40px 60px',
              boxShadow: '0 0 50px rgba(255, 0, 0, 0.5)',
              transform: 'scale(1.1)',
              animation: 'pulse 2s infinite'
            }}>
              <h1 style={{
                fontSize: '4rem',
                margin: '0 0 20px 0',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
                color: '#ff4444',
                fontWeight: 'bold',
                letterSpacing: '4px'
              }}>
                💀 GAME OVER! 💀
              </h1>
              
              <p style={{
                fontSize: '1.5rem',
                margin: '20px 0',
                color: '#ffaaaa',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
              }}>
                🏃‍♂️ You were caught by a creature! 👻
              </p>
              
              <p style={{
                fontSize: '2rem',
                margin: '20px 0',
                color: '#ffff00',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                border: '2px solid #ffff00',
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 0, 0.1)'
              }}>
                🎯 Final Score: {score}
              </p>
              
              <button 
                onClick={() => {
                  // Reset game state
                  setGameOver(false);
                  setPacmanPos({ x: 9, y: 6 });
                  setScore(0);
                  setGameMap(maze);
                  setCreatures([
                    { id: 1, x: 9, y: 5, color: 'red' },
                    { id: 2, x: 9, y: 6, color: 'blue' },
                    { id: 3, x: 9, y: 7, color: 'green' }
                  ]);
                }}
                style={{
                  fontSize: '1.8rem',
                  padding: '15px 40px',
                  backgroundColor: '#00ff00',
                  color: '#000000',
                  border: '3px solid #ffffff',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 8px 20px rgba(0, 255, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  marginTop: '30px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.backgroundColor = '#44ff44';
                  e.target.style.boxShadow = '0 12px 30px rgba(0, 255, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = '#00ff00';
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 255, 0, 0.4)';
                }}
              >
                🔄 PLAY AGAIN
              </button>
            </div>
          </div>
        ) : (
          <div className="game-instructions">Use arrow keys to move! Avoid the creatures!</div>
        )}
        
        {/* The Maze */}
        <div 
          className="maze" 
          style={{
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE,
            position: 'relative',
            margin: '20px auto',
            border: '3px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Render each cell of the maze */}
          {gameMap.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`maze-cell ${
                  cell === 1 ? 'wall' : 
                  cell === 2 ? 'dot' : 'path'
                }`}
                style={{
                  position: 'absolute',
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              />
            ))
          )}
          
          {/* Pac-Man Character */}
          <div
            className="pacman"
            style={{
              position: 'absolute',
              left: pacmanPos.x * CELL_SIZE + 3, // Small offset for centering
              top: pacmanPos.y * CELL_SIZE + 3,
              width: CELL_SIZE - 6,
              height: CELL_SIZE - 6,
              transition: 'all 0.15s ease' // Smooth movement animation
            }}
          />
          
          {/* 👻 CREATURES - Render each creature on the maze */}
          {creatures.map(creature => (
            <div
              key={creature.id}
              className="creature"
              style={{
                position: 'absolute',
                left: creature.x * CELL_SIZE + 2, // Small offset for centering
                top: creature.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                backgroundColor: creature.color,
                borderRadius: '50% 50% 0 0', // Ghost-like shape (rounded top, flat bottom)
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease', // Smooth movement animation
                opacity: gameOver ? 0.5 : 1, // Fade creatures when game is over
                // Add some depth with shadow
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Memory Card Game Component - A fun card matching game!
function MemoryCardGame() {
  // Game constants
  const CARD_PAIRS = 8; // Number of pairs to match (8 pairs = 16 cards total)
  
  // Create card data - we'll use emojis as card faces
  const cardEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  
  // Create the deck: each emoji appears twice (for pairs)
  const createDeck = () => {
    const deck = [];
    cardEmojis.forEach((emoji, index) => {
      // Add two cards for each emoji (that's how we make pairs!)
      deck.push({ id: index * 2, emoji, isFlipped: false, isMatched: false });
      deck.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false });
    });
    // Shuffle the deck so cards are in random order
    return deck.sort(() => Math.random() - 0.5);
  };

  // Game state - tracks everything happening in our card game
  const [cards, setCards] = useState(createDeck()); // All the cards
  const [flippedCards, setFlippedCards] = useState([]); // Currently flipped cards
  const [score, setScore] = useState(0); // Number of pairs found
  const [moves, setMoves] = useState(0); // Number of moves made
  const [gameWon, setGameWon] = useState(false); // Is the game completed?

  // Handle clicking on a card
  const handleCardClick = (cardId) => {
    // Don't do anything if:
    // - Game is won
    // - Card is already flipped
    // - Card is already matched
    // - Two cards are already flipped (wait for them to flip back)
    const card = cards.find(c => c.id === cardId);
    if (gameWon || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    // Flip the card
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    // Add this card to our flipped cards list
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // If this is the second card flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(prevMoves => prevMoves + 1); // Count this as a move
      
      const firstCard = cards.find(c => c.id === newFlippedCards[0]);
      const secondCard = cards.find(c => c.id === newFlippedCards[1]);

      // Check if the two cards match (same emoji)
      if (firstCard.emoji === secondCard.emoji) {
        // It's a match! Mark both cards as matched
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
            )
          );
          setScore(prevScore => prevScore + 1);
          setFlippedCards([]); // Clear flipped cards
          
          // Check if all pairs are found (game won!)
          if (score + 1 === CARD_PAIRS) {
            setGameWon(true);
          }
        }, 500); // Wait half a second to show the match
      } else {
        // No match - flip cards back after a short delay
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000); // Wait 1 second to let player see both cards
      }
    }
  };

  // Reset the game
  const resetGame = () => {
    setCards(createDeck());
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setGameWon(false);
  };

  return (
    <div className="game-container">
      <div className="card-game-area">
        {/* Game Header with Score and Controls */}
        <div className="game-header">
          <h1 className="title">🃏 Memory Card Game</h1>
          <div className="game-stats">
            <div className="stat">Pairs Found: {score}/{CARD_PAIRS}</div>
            <div className="stat">Moves: {moves}</div>
            <button className="reset-button" onClick={resetGame}>
              🔄 New Game
            </button>
          </div>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className="win-message">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You found all pairs in {moves} moves!</p>
            <button className="play-again-button" onClick={resetGame}>
              🎮 Play Again
            </button>
          </div>
        )}

        {/* Card Grid */}
        <div className="card-grid">
          {cards.map(card => (
            <div
              key={card.id}
              className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-front">
                {/* This is the back of the card (what you see when it's face down) */}
                <span className="card-back-symbol">🎮</span>
              </div>
              <div className="card-back">
                {/* This is the front of the card (the emoji you're trying to match) */}
                <span className="card-emoji">{card.emoji}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Game Instructions */}
        <div className="game-instructions">
          <p>Click cards to flip them and find matching pairs!</p>
          <p>Find all {CARD_PAIRS} pairs to win the game.</p>
        </div>
      </div>
    </div>
  );
}

// Main App component with tab navigation
function App() {
  // State to track which tab is currently active
  // 'balls' = bouncing balls game, 'pacman' = pac-man game, 'cards' = memory card game
  const [activeTab, setActiveTab] = useState('balls');

  return (
    <div className="app">
      {/* Tab Navigation Bar */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'balls' ? 'active' : ''}`}
          onClick={() => setActiveTab('balls')}
        >
          ⚡ Bouncing Balls
        </button>
        <button
          className={`tab-button ${activeTab === 'pacman' ? 'active' : ''}`}
          onClick={() => setActiveTab('pacman')}
        >
          🟡 Pac-Man
        </button>
        <button
          className={`tab-button ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          🃏 Memory Cards
        </button>
      </div>

      {/* Game Content - shows different game based on active tab */}
      <div className="tab-content">
        {activeTab === 'balls' && <BouncingBallsGame />}
        {activeTab === 'pacman' && <PacManGame />}
        {activeTab === 'cards' && <MemoryCardGame />}
      </div>
    </div>
  );
}

// Export the main App component so other files can use it
export default App;
