import Game from "./Game.js";
function Interface() {
  let game = null;
  
  document.body.innerHTML = `
   <div class="game-container">
  <div class="turn-indicator"></div>
  <div class="boards">
    <table class="current-board"></table>
    <table class="opponent-board"></table>
  </div>
  <div class="toggle-container">
    <label for="opponent-toggle">Opponent:</label>
    <select id="opponent-toggle">
      <option value="human">Human</option>
      <option value="bot">Bot</option>
    </select>
  </div>
  <button class="reset-button">Reset Game</button>
</div>
<div class="overlay hidden">
  <div class="prompt hidden">
    <p class="prompt-text"></p>
    <button class="ok-button">OK</button>
  </div>
</div>
  <div class="placement-screen hidden">
    <h2 class="placement-heading"></h2>
    <table class="placement-board"></table>
    <button class="confirm-button">Confirm Placements</button>
  </div>
  `;

  
  const currentTable = document.querySelector(".current-board");
  const opponentTable = document.querySelector(".opponent-board");
  const turn = document.querySelector(".turn-indicator");
  const overlay = document.querySelector(".overlay");
  const prompt = document.querySelector(".prompt");
  const promptText = document.querySelector(".prompt-text");
  const okButton = document.querySelector(".ok-button");
  const resetButton = document.querySelector(".reset-button");

  
  const placementScreen = document.querySelector(".placement-screen");
  const placementHeading = document.querySelector(".placement-heading");
  const placementTable = document.querySelector(".placement-board");
  const confirmButton = document.querySelector(".confirm-button");
  
  const opponentToggle = document.querySelector("#opponent-toggle");
  opponentToggle.value = "bot"; 
  
  opponentToggle.addEventListener("change", () => {
    const opponentType = opponentToggle.value; 
    startGame(opponentType); 
  });
  
  okButton.addEventListener("click", () => {
    hidePrompt();
  });

  resetButton.addEventListener("click", () => {
    reset(); 
  });

  opponentTable.addEventListener("click", (event) => {
    
    const tile = event.target.closest(".tile");
    if (!tile) return;
    const x = parseInt(tile.dataset.x, 10);
    const y = parseInt(tile.dataset.y, 10);
    if (isNaN(x) || isNaN(y)) return; 
    try {
      const hit = game.attack([x, y]);
      if (
        game.currentBoard.allShipsSunk() ||
        hit ||
        game.opponentPlayer.isBot
      ) {
        renderBoards();
      } else {
        showPrompt();
      }
    } catch (error) {
      console.error("Attack failed:", error.message);
    }
  });
  
  confirmButton.addEventListener("click", () => {
    const currentPlayerName = placementTable.dataset.player;
    if (currentPlayerName === "Player 1" && !game.player2.isBot) {
      renderPlacementScreen("Player 2"); 
    } else {
      placementScreen.classList.add("hidden");
      showPrompt();
    }
  });

  
  placementTable.addEventListener("dragstart", (event) => {
    const tile = event.target.closest(".tile.ship");
    if (!tile) return;

    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        x: tile.dataset.x,
        y: tile.dataset.y,
        orientation: tile.dataset.orientation,
      })
    );
  });

  placementTable.addEventListener("dragover", (event) => {
    event.preventDefault(); 
  });

  placementTable.addEventListener("drop", (event) => {
    event.preventDefault();
    const cell = event.target.closest("td");
    if (!cell) return;

    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    const newX = parseInt(cell.parentElement.rowIndex, 10);
    const newY = parseInt(cell.cellIndex, 10);
    const playerName = placementTable.dataset.player; 
    const board =
      playerName === "Player 1" ? game.player1.board : game.player2.board;
    try {
      board.repositionShip([data.x, data.y], [newX, newY], data.orientation);
      renderPlacementScreen(playerName); 
    } catch (error) {
      console.error("Repositioning failed:", error.message);
    }
  });

  
  placementTable.addEventListener("click", (event) => {
    const tile = event.target.closest(".tile.ship");
    if (!tile) return;

    const newOrientation =
      tile.dataset.orientation === "horizontal" ? "vertical" : "horizontal";
    const x = parseInt(tile.dataset.x, 10);
    const y = parseInt(tile.dataset.y, 10);
    const playerName = placementTable.dataset.player;
    const board =
      playerName === "Player 1" ? game.player1.board : game.player2.board;
    try {
      board.repositionShip([x, y], [x, y], newOrientation);
      renderPlacementScreen(playerName); 
    } catch (error) {
      console.error("Failed to flip orientation:", error.message);
    }
  });
  function showPrompt() {
    promptText.textContent = `${game.currentPlayerName}'s turn. Click OK to continue.`;
    overlay.classList.remove("hidden");
    prompt.classList.remove("hidden");
  }
  function hidePrompt() {
    
    overlay.classList.add("hidden");
    prompt.classList.add("hidden");
    renderBoards();
  }

  function renderBoards() {
    
    currentTable.innerHTML = "";
    opponentTable.innerHTML = "";

    
    for (let x = 0; x < 10; x++) {
      const row = document.createElement("tr");
      for (let y = 0; y < 10; y++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        const cell = document.createElement("td");

        if (game.currentBoard[x][y].ship) {
          if (game.currentBoard[x][y].ship.isSunk) {
            
            tile.classList.add("sunken");
          } else if (game.currentBoard[x][y].hit) {
            
            tile.classList.add("hit");
          } else {
            
            tile.classList.add("ship");
          }
        } else if (game.currentBoard[x][y].hit) {
          
          tile.classList.add("miss");
        }
        if (game.currentBoard[x][y].hit) {
          tile.textContent = "X";
        }

        cell.appendChild(tile);
        row.appendChild(cell);
      }
      currentTable.appendChild(row);
    }

    
    for (let x = 0; x < 10; x++) {
      const row = document.createElement("tr");
      for (let y = 0; y < 10; y++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        const cell = document.createElement("td");

        
        tile.dataset.x = x;
        tile.dataset.y = y;

        if (game.opponentBoard[x][y].hit) {
          tile.textContent = "X";
          if (
            game.opponentBoard[x][y].ship &&
            game.opponentBoard[x][y].ship.isSunk
          ) {
            
            tile.classList.add("sunken");
          } else if (game.opponentBoard[x][y].ship) {
            
            tile.classList.add("hit");
          } else {
            
            tile.classList.add("miss");
          }
        }

        cell.appendChild(tile);
        row.appendChild(cell);
      }
      opponentTable.appendChild(row);
    }

    
    turn.textContent = `Current Turn: ${game.currentPlayerName}`;
    if (game.currentBoard.allShipsSunk()) {
      turn.textContent = `Game Over! ${game.winner} wins! Reset to play again.`;
    }
  }
  function reset() {
    startGame();
  }

  function renderPlacementScreen(playerName) {
    
    placementHeading.textContent = `${playerName}'s Ship Placement`;
    const board =
      playerName === "Player 1" ? game.player1.board : game.player2.board;
    
    placementTable.innerHTML = "";
    placementTable.dataset.player = playerName; 
    
    for (let x = 0; x < 10; x++) {
      const row = document.createElement("tr");
      for (let y = 0; y < 10; y++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        const cell = document.createElement("td");

        const ship = board[x][y].ship;
        if (ship) {
          tile.classList.add("ship");
          tile.draggable = true; 
          tile.dataset.x = x;
          tile.dataset.y = y;
          tile.dataset.orientation = board[x][y].orientation;
        }

        cell.appendChild(tile);
        row.appendChild(cell);
      }
      placementTable.appendChild(row);
    }

   
    placementScreen.classList.remove("hidden");
  }

  function startGame(p2 = "bot") {
    game = Game("human", p2);
    renderPlacementScreen("Player 1");

    //no need to check bot as p1 always human
  }
  startGame();
}

Interface();
