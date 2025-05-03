import api from './APIClient.js';

// The player class, which represents one player on the field.
export class Player {
  //A player requires an ID, x, y, and color. LogicalX, logicalY, and element are created later.
  constructor(uniqueId, id, x, y, color) {
    this.uniqueId = uniqueId;
    this.id = id;
    this.x = x;
    this.y = y;
    this.logicalX = x;
    this.logicalY = y;
    this.color = color;
    this.element = null;
  }
  
  //Render the player by creating a circle element in the SVG container. Represents the "element" property.
  render(container) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", this.y);
    circle.classList.add("player");
    circle.setAttribute("fill", this.color);
    circle.setAttribute("id", `${this.id}`);
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "2");
    
    container.appendChild(circle);
    this.element = circle;
    return circle;
  }
}

//The ball class, which represents the ball on the field.
export class Ball {
  //Constructs the ball. Requires an x and y coordinate. LogicalX, logicalY, and element are created later. No ID required.
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.logicalX = x;
    this.logicalY = y;
    this.element = null;
  }

  //Renders the ball. Creates a circle element in the SVG container. Represents the "element" property.
  render(container) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", this.y);
    circle.classList.add("ball");
    circle.setAttribute("fill", "#ffffff");
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "2");
    
    container.appendChild(circle);
    this.element = circle;
    return circle;
  }
}

// The field class, which represents the playing field and manages players and the ball.
export class Field {
  // Constructs a field, preparing for the graphics (svg), all players, ball, all frames, etc.
  constructor(containerSelector, playId) {
    this.container = document.querySelector(containerSelector);
    this.svg = null;
    this.players = [];
    this.ball = null;
    this.frames = [];
    this.currentFrameIndex = 0;
    this.isPlaying = false;
    this.playId = playId;
  }

  // Initialize the field by creating the SVG element and setting up the field background.
  async initialize() {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.classList.add("field");
    
    const field = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    field.setAttribute("width", "100%");
    field.setAttribute("height", "100%");
    field.setAttribute("fill", "#3a7d44");
    field.setAttribute("stroke", "#333");
    field.setAttribute("stroke-width", "0.125rem");
    
    this.svg.appendChild(field);
    this.container.appendChild(this.svg);
    
    this.svg.style.width = "100%";
    this.svg.style.height = "100%";
    
    this.resize();
    
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => this.resize());
    });
  
    // Set up the play title
    try {
      if(this.playId !== "default"){
        const playData = await api.getPlayById(this.playId);
        const titleElement = document.getElementById('playTitle');
        titleElement.textContent = playData.play.title;
      }
      
    } catch (error) {
      console.error("Error fetching play title:", error);
    }
  }

  /**************************/
  /* OBJECT AND FIELD CREATION */
  /**************************/

  //Add a player to the field. Requires an ID, x, y, and color. Returns the player object.
  addPlayer(uniqueId, id, x, y, color) {
    // Ensure ID is a string for consistency
    const playerId = String(id);
    
    const player = new Player(uniqueId, playerId, 0, 0, color);
    player.logicalX = x;
    player.logicalY = y;
    
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      player.x = (x / 600) * this.viewBoxWidth;
      player.y = (y / 400) * this.viewBoxHeight;
    } else {
      player.x = ((400 - y) / 400) * this.viewBoxWidth;
      player.y = (x / 600) * this.viewBoxHeight;
    }
    
    // Render the player and store the element reference
    player.render(this.svg);
    
    this.players.push(player);
    return player;
  }

  // Add a ball to the field. Requires an x and y coordinate. Returns the ball object.
  addBall(x, y) {
    const ball = new Ball(0, 0);
    ball.logicalX = x;
    ball.logicalY = y;
    
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      ball.x = (x / 600) * this.viewBoxWidth;
      ball.y = (y / 400) * this.viewBoxHeight;
    } else {
      ball.x = ((400 - y) / 400) * this.viewBoxWidth;
      ball.y = (x / 600) * this.viewBoxHeight;
    }
    
    ball.render(this.svg);
    return ball;
  }

  // Sets up the initial formation of players and the ball on the field (frame 0).
  async setupFormation() {
    this.players = [];
    await this.fetchFrames();
    const firstFrame = this.frames[0];
    try {
      if(this.playId == "default"){
        this.setupDefaultFormation();
        return;
      }
      const objects = await api.getFrameObjects(firstFrame.id);
      
      const teamColors = {
        red: "#D72323",
        yellow: "#FFBC0A",
        green: "#04E762", 
        blue: "#3993DD",
        purple: "#C200FB",
      };
      
      objects.forEach(object => {
        this.addPlayer(object.id, String(object.player_id), object.object_x, object.object_y, teamColors[object.color]);
      });
      
      // Add ball using coordinates from the frame
      this.ball = this.addBall(firstFrame.ball_x, firstFrame.ball_y);
    } catch (error) {
      console.error("Error setting up formation:", error);
      this.setupDefaultFormation();
    }
  }
  
  // Fallback method in case API calls fail
  setupDefaultFormation() {
    const teamColors = {
      red: "#D72323",
      yellow: "#FFBC0A",
      green: "#04E762",
      blue: "#3993DD",
      purple: "#C200FB",
    };
    
    this.addPlayer(100, "1", 150, 100, teamColors.red);
    this.addPlayer(101, "2", 150, 150, teamColors.red);
    this.addPlayer(102, "3", 150, 200, teamColors.red);
    this.addPlayer(103, "4", 150, 250, teamColors.red);
    this.addPlayer(104, "5", 150, 300, teamColors.red);
    
    this.addPlayer(105, "6", 450, 100, teamColors.blue);
    this.addPlayer(106, "7", 450, 150, teamColors.blue);
    this.addPlayer(107, "8", 450, 200, teamColors.blue);
    this.addPlayer(108, "9", 450, 250, teamColors.blue);
    this.addPlayer(109, "10", 450, 300, teamColors.blue);
  
    this.ball = this.addBall(300, 200);
  }

  // Sets up the left and right arrows for navigation through frames
  setupNavigation() {
    const leftArrow = document.querySelector('.larrow');
    const rightArrow = document.querySelector('.rarrow');
    
    leftArrow.addEventListener('click', () => {
      this.previousFrame();
    });
    rightArrow.addEventListener('click', () => {
      this.nextFrame();
    });
  }

  /**************************/
  /* POSITIONING AND RESIZING */
  /*************************/

  // Helper method to convert logical to viewBox coordinates
  logicalToViewBox(logicalX, logicalY) {
    const isLandscape = window.innerWidth > window.innerHeight;
    let viewBoxX, viewBoxY;
    
    if (isLandscape) {
      viewBoxX = (logicalX / 600) * this.viewBoxWidth;
      viewBoxY = (logicalY / 400) * this.viewBoxHeight;
    } else {
      viewBoxX = ((400 - logicalY) / 400) * this.viewBoxWidth;
      viewBoxY = (logicalX / 600) * this.viewBoxHeight;
    }
    return { x: viewBoxX, y: viewBoxY };
  }

  // Helper method to convert viewBox to logical coordinates
  viewBoxToLogical(viewBoxX, viewBoxY) {
    const isLandscape = window.innerWidth > window.innerHeight;
    let logicalX, logicalY;
    
    if (isLandscape) {
      logicalX = (viewBoxX / this.viewBoxWidth) * 600;
      logicalY = (viewBoxY / this.viewBoxHeight) * 400;
    } else {
      logicalX = (viewBoxY / this.viewBoxHeight) * 600;
      logicalY = 400 - (viewBoxX / this.viewBoxWidth) * 400;
    }
    
    return { x: logicalX, y: logicalY };
  }

  // Forcibly redraws the current frame to fix bug where they don't move when the screen is rotated.
  forceRepositionAll() {
    this.players.forEach(player => {
      if (player && player.element) {
        const viewBoxPos = this.logicalToViewBox(player.logicalX, player.logicalY);
        
        const newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        newCircle.setAttribute("cx", viewBoxPos.x);
        newCircle.setAttribute("cy", viewBoxPos.y);
        newCircle.setAttribute("fill", player.color);
        newCircle.setAttribute("id", player.id);
        newCircle.setAttribute("stroke", "black");
        newCircle.setAttribute("stroke-width", "2");
        newCircle.classList.add("player");
        
        this.svg.replaceChild(newCircle, player.element);
        player.element = newCircle;
        player.x = viewBoxPos.x;
        player.y = viewBoxPos.y;
        
        if (this instanceof EditableField) {
          player.element.addEventListener('click', () => {
            this.selectPlayer(player);
          });
        }
      }
    });
    
    // Reposition the ball
    if (this.ball && this.ball.element) {
      const viewBoxPos = this.logicalToViewBox(this.ball.logicalX, this.ball.logicalY);
      
      const newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      newCircle.setAttribute("cx", viewBoxPos.x);
      newCircle.setAttribute("cy", viewBoxPos.y);
      newCircle.setAttribute("fill", "#ffffff");
      newCircle.setAttribute("stroke", "black");
      newCircle.setAttribute("stroke-width", "2");
      newCircle.classList.add("ball");
      
      this.svg.replaceChild(newCircle, this.ball.element);
      this.ball.element = newCircle;
      this.ball.x = viewBoxPos.x;
      this.ball.y = viewBoxPos.y;
    }
  }

  // Resizes the field any time the screen is shifted. Checks whether the screen is landscape or portrait.
  resize() {
    // Store old orientation
    const wasLandscape = this.viewBoxWidth > this.viewBoxHeight;
    
    // Update SVG dimensions
    this.svg.style.width = "100%";
    this.svg.style.height = "100%";
    
    // Calculate new orientation and viewBox dimensions
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isLandscape) {
      this.viewBoxWidth = 1000;
      this.viewBoxHeight = 500;
    } else {
      this.viewBoxWidth = 500;
      this.viewBoxHeight = 1000;
    }
    
    // Apply new viewBox
    this.svg.setAttribute("viewBox", `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`);
    
    // Force layout recalculation
    this.svg.getBoundingClientRect();
    
    // If orientation has changed, we definitely need to recalculate positions
    if (wasLandscape !== isLandscape || !wasLandscape) {
      if (this.players && this.players.length > 0) {
        this.forceRepositionAll();
      }
    } else {
      // Even if orientation hasn't changed, still check if we need to reposition
      if (this.frames && this.frames.length > 0) {
        this.forceRepositionAll();
      } else {
        this.repositionObjects(isLandscape);
      }
    }
  }

  // Derives the new x and y coordinates of the players and ball based on the current screen orientation and size.
  repositionObjects(isLandscape) {
    const logicalWidth = 600;
    const logicalHeight = 400;
    
    this.players.forEach(player => {
      if (player.element) {
        let viewBoxX, viewBoxY;
        
        if (isLandscape) {
          viewBoxX = (player.logicalX / logicalWidth) * this.viewBoxWidth;
          viewBoxY = (player.logicalY / logicalHeight) * this.viewBoxHeight;
        } else {
          viewBoxX = ((logicalHeight - player.logicalY) / logicalHeight) * this.viewBoxWidth;
          viewBoxY = (player.logicalX / logicalWidth) * this.viewBoxHeight;
        }
        
        player.x = viewBoxX;
        player.y = viewBoxY;
        
        // Update position immediately without animation
        player.element.setAttribute("cx", viewBoxX);
        player.element.setAttribute("cy", viewBoxY);
      }
    });
  
    //Same for ball as for all players
    if (this.ball && this.ball.element) {
      let viewBoxX, viewBoxY;
      
      if (isLandscape) {
        viewBoxX = (this.ball.logicalX / logicalWidth) * this.viewBoxWidth;
        viewBoxY = (this.ball.logicalY / logicalHeight) * this.viewBoxHeight;
      } else {
        viewBoxX = ((logicalHeight - this.ball.logicalY) / logicalHeight) * this.viewBoxWidth;
        viewBoxY = (this.ball.logicalX / logicalWidth) * this.viewBoxHeight;
      }
      
      this.ball.x = viewBoxX;
      this.ball.y = viewBoxY;
      
      this.ball.element.setAttribute("cx", viewBoxX);
      this.ball.element.setAttribute("cy", viewBoxY);
    }
  }

  /**********************/
  /* FRAMES AND ANIMATION */
  /*********************/

  // Get all of the frames from the database
  async fetchFrames() {
    try {
      const frames = await api.getPlayFrames(this.playId);
      this.frames = frames;
    } catch (error) {
      console.error("Error fetching frames:", error);
    }
  }

  // Plays the previous frame in order.
  previousFrame() {
    if (this.currentFrameIndex > 0) {
      this.currentFrameIndex--;
      this.playFrame(this.currentFrameIndex, 500);
    }
  }
  
  // Plays the next frame in order.
  nextFrame() {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.playFrame(this.currentFrameIndex, 500);
    }
  }

  // Plays a specific frame of the animation. Updates player and ball positions based on the frame data.
  playFrame(frameIndex, duration = 1000) {
    if (frameIndex >= this.frames.length) return;
   
    const frameData = this.frames[frameIndex];
    
    // Update frame number display
    const frameNumber = document.querySelector('.framenumber h3');
    frameNumber.textContent = `Frame ${frameIndex + 1}`;
    
    frameData.players.forEach(playerData => {
      // Use strict equality for ID comparison
      const player = this.players.find(p => p.id == playerData.id);
      if (!player || !player.element) return;
      
      const isLandscape = window.innerWidth > window.innerHeight;
      let viewBoxX, viewBoxY;
      
      if (isLandscape) {
        viewBoxX = (playerData.x / 600) * this.viewBoxWidth;
        viewBoxY = (playerData.y / 400) * this.viewBoxHeight;
      } else {
        viewBoxX = ((400 - playerData.y) / 400) * this.viewBoxWidth;
        viewBoxY = (playerData.x / 600) * this.viewBoxHeight;
      }
      
      player.logicalX = playerData.x;
      player.logicalY = playerData.y;

      Motion.animate(player.element, {cx: viewBoxX, cy: viewBoxY}, { duration: duration / 1000, easing: 'ease-in-out' });
    });
    
    if (this.ball && this.ball.element) {
      const isLandscape = window.innerWidth > window.innerHeight;
      let viewBoxX, viewBoxY;
      
      if (isLandscape) {
        viewBoxX = (frameData.ball.x / 600) * this.viewBoxWidth;
        viewBoxY = (frameData.ball.y / 400) * this.viewBoxHeight;
      } else {
        viewBoxX = ((400 - frameData.ball.y) / 400) * this.viewBoxWidth;
        viewBoxY = (frameData.ball.x / 600) * this.viewBoxHeight;
      }
      
      this.ball.logicalX = frameData.ball.x;
      this.ball.logicalY = frameData.ball.y;
      
      Motion.animate(this.ball.element, {cx: viewBoxX, cy: viewBoxY}, { duration: duration / 1000, easing: 'ease-in-out' });
    }
  }

  async fetchPlayerMovements() {
    const playerMovements = new Map();
    // Get all players from the first frame
    const firstFrame = this.frames[0];
    if (!firstFrame) return playerMovements;
    
    const objects = await api.getFrameObjects(firstFrame.id);
    for (const object of objects) {
      const playerId = object.player_id || object.id;
      try {
        // Get all movements for this player
        const movements = await api.getObjectMoves(playerId);
        playerMovements.set(playerId, movements);
      } catch (error) {
        console.error(`Error fetching movements for player ${playerId}:`, error);
      }
    }
    
    return playerMovements;
  }
  
  // Play the full animation sequence. Loops through all frames and plays them in order.
  playAnimation() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Reset to first frame if we're at the end
    if (this.currentFrameIndex >= this.frames.length - 1) {
      this.currentFrameIndex = 0;
    }
    
    const playSequence = async () => {
      while (this.currentFrameIndex < this.frames.length - 1 && this.isPlaying) {
        this.currentFrameIndex++;
        this.playFrame(this.currentFrameIndex);
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      this.isPlaying = false;
    };
    
    playSequence();
  }

  //Rewinds the animation back to the first frame
  rewindAnimation() {
    this.currentFrameIndex = 0;
    this.isPlaying = false;
    
    this.playFrame(0, 500);
    
    const frameNumber = document.querySelector('.framenumber h3');
    frameNumber.textContent = 'Frame 1';
  }

  setupAnimation() {
    this.setupNavigation();
    
    const playButton = document.getElementById('playButton');
    if (playButton) {
      
      playButton.addEventListener('click', () => {
        this.playAnimation();
      });
    }

    const rewindButton = document.getElementById('rewindButton');
    if (rewindButton) {
      rewindButton.addEventListener('click', () => {
        this.rewindAnimation();
      });
    }
    
    const frameNumber = document.querySelector('.framenumber h3');
    if (frameNumber) {
      frameNumber.textContent = 'Frame 1';
    }
  }

  // Sets up the animation frames from the database
  async setupAnimationFrames() {
    this.frames = [];
    
    try {
      // Get all frames for this play
      const apiFrames = await api.getPlayFrames(this.playId);
      
      // Process each frame individually to ensure player data is correctly included
      for (const apiFrame of apiFrames) {
        // Get the objects (players) for this specific frame
        const frameObjects = await api.getFrameObjects(apiFrame.id);
        
        const teamColors = {
          red: "#D72323",
          yellow: "#FFBC0A",
          green: "#04E762",
          blue: "#3993DD",
          purple: "#C200FB",
        };
        
        // Create a frame with players
        const frameData = {
          id: apiFrame.id,
          players: frameObjects.map(obj => ({
            uniqueId: obj.id,
            id: String(obj.player_id),
            x: obj.object_x,
            y: obj.object_y,
            color: teamColors[obj.color]
          })),
          ball: { x: apiFrame.ball_x, y: apiFrame.ball_y }
        };
        
        this.frames.push(frameData);
      }
      
      // If no frames were found, add a default frame
      if (this.frames.length === 0) {
        this.addDefaultFrame();
      }
    } catch (error) {
      console.error("Error setting up animation frames:", error);
      this.addDefaultFrame();
    }
  }

  // Helper method to add a default frame
  addDefaultFrame() {
    this.frames.push({
      id: "default",
      players: this.players.map(p => ({ 
        id: p.id, 
        uniqueId: p.uniqueId,
        x: p.logicalX, 
        y: p.logicalY,
        color: p.color 
      })),
      ball: { x: this.ball.logicalX, y: this.ball.logicalY }
    });
  }
}

// Extended field class for coaches with editing capabilities
export class EditableField extends Field {
  constructor(containerSelector, playId) {
    super(containerSelector, playId);
    this.selectedPlayer = null;
    this.selectionRect = null;
    this.deleteButton = null;
    this.isDragging = false;
    this.dragTarget = null;
  }

  // Override the initialize method to add drag and click handlers
  async initialize() {
    await super.initialize();
    this.setupDragHandlers();
    this.initializeColorPicker();
    this.initializeAddPlayers();
    this.initializeAddFrame();
    this.initializeRemoveFrame();
    this.initializeTitleEdit();

    // Add click handler to the SVG background
    this.svg.addEventListener('click', (e) => {
      // Only handle direct clicks on the SVG or its background rect
      if (e.target === this.svg || e.target === this.svg.firstChild) {
        this.clearSelection();
      }
    });
  }

  async setupFormation() {
    this.frames = [];
    await super.setupFormation();
    await this.setupAnimationFrames();
    this.addPlayerClickHandlers();
  }

  // Helper method to update visual position based on logical position
  updateElementPosition(element) {
    const isLandscape = window.innerWidth > window.innerHeight;
    let viewBoxX, viewBoxY;
    
    if (isLandscape) {
      viewBoxX = (element.logicalX / 600) * this.viewBoxWidth;
      viewBoxY = (element.logicalY / 400) * this.viewBoxHeight;
    } else {
      viewBoxX = ((400 - element.logicalY) / 400) * this.viewBoxWidth;
      viewBoxY = (element.logicalX / 600) * this.viewBoxHeight;
    }
    
    // Update the SVG element position
    element.element.setAttribute('cx', viewBoxX);
    element.element.setAttribute('cy', viewBoxY);
    
    // Update x and y properties
    element.x = viewBoxX;
    element.y = viewBoxY;
    
    // Update selection rectangle
    if (element === this.selectedPlayer && this.selectionRect) {
      const sizePercentage = 0.11;
      const rectSize = Math.min(this.viewBoxWidth, this.viewBoxHeight) * sizePercentage;
      
      this.selectionRect.setAttribute('x', viewBoxX - rectSize/2);
      this.selectionRect.setAttribute('y', viewBoxY - rectSize/2);
      this.selectionRect.setAttribute('width', rectSize);
      this.selectionRect.setAttribute('height', rectSize);
    }
  }

  // Override forceRepositionAll to handle selection rectangle and delete button
  forceRepositionAll() {
    super.forceRepositionAll();
    
    // Reposition selection rectangle if needed
    if (this.selectedPlayer && this.selectionRect) {
      const viewBoxPos = this.logicalToViewBox(this.selectedPlayer.logicalX, this.selectedPlayer.logicalY);
      
      const sizePercentage = 0.11;
      const rectSize = Math.min(this.viewBoxWidth, this.viewBoxHeight) * sizePercentage;
      
      this.selectionRect.setAttribute("x", viewBoxPos.x - rectSize/2);
      this.selectionRect.setAttribute("y", viewBoxPos.y - rectSize/2);
      this.selectionRect.setAttribute("width", rectSize);
      this.selectionRect.setAttribute("height", rectSize);
      
      // Reposition delete button if it exists
      if (this.deleteButton) {
        this.svg.removeChild(this.deleteButton);
        this.createDeleteButton(viewBoxPos.x + rectSize/2, viewBoxPos.y - rectSize/2);
      }
    }
  }

  // Override the resize method to reset dragging
  resize() {
    super.resize();
    this.forceRepositionAll();
    this.isDragging = false;
    this.dragTarget = null;
  }
  
  /************************/
  /* DRAGGING AND SELECTION */
  /***********************/

  // Helper method to clear selection and reset drag state
  clearSelection() {
    if (this.selectionRect) {
      this.svg.removeChild(this.selectionRect);
      this.selectionRect = null;
    }
    
    if (this.deleteButton) {
      this.svg.removeChild(this.deleteButton);
      this.deleteButton = null;
    }
    
    this.selectedPlayer = null;
    this.isDragging = false;
    this.dragTarget = null;
  }

  // MOUSE EVENT HANDLERS
  handleMouseDown(e) {
    const target = e.target;
    
    // If clicking on delete button, let delete button handle itself
    if (this.deleteButton) {
      const deleteButtonElements = [this.deleteButton, ...Array.from(this.deleteButton.children)];
      if (deleteButtonElements.includes(target)) return;
    }
    
    // If clicking on a player
    if (target.id) {
      const player = this.players.find(p => p.id == target.id);
      this.isDragging = true;
      this.dragTarget = player;
      e.preventDefault();
      return;
    }
    
    // If clicking on the ball
    if (target === this.ball.element) {
      this.isDragging = true;
      this.dragTarget = this.ball;
      e.preventDefault();
      return;
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.dragTarget) return;
    
    // Get the SVG's position
    const svgRect = this.svg.getBoundingClientRect();
    
    // Calculate coordinates
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    const viewBoxX = (mouseX / svgRect.width) * this.viewBoxWidth;
    const viewBoxY = (mouseY / svgRect.height) * this.viewBoxHeight;
    const logical = this.viewBoxToLogical(viewBoxX, viewBoxY);
    
    // Apply constraints
    const isBall = this.dragTarget === this.ball;
    const minX = isBall ? 8 : 20;
    const maxX = isBall ? 592 : 580;
    const minY = isBall ? 8 : 20;
    const maxY = isBall ? 392 : 380;
    
    logical.x = Math.max(minX, Math.min(maxX, logical.x));
    logical.y = Math.max(minY, Math.min(maxY, logical.y));
    
    // Update logical position
    this.dragTarget.logicalX = logical.x;
    this.dragTarget.logicalY = logical.y;
    
    // Update the visual position
    const viewBoxPos = this.logicalToViewBox(logical.x, logical.y);
    Motion.animate(this.dragTarget.element, 
      {cx: viewBoxPos.x, cy: viewBoxPos.y}, 
      {duration: 0, easing: 'linear'}
    );
    this.dragTarget.x = viewBoxPos.x;
    this.dragTarget.y = viewBoxPos.y;
    
    // Update selection rectangle and delete button if needed
    if (this.dragTarget === this.selectedPlayer && this.selectionRect) {
      const sizePercentage = 0.11;
      const rectSize = Math.min(this.viewBoxWidth, this.viewBoxHeight) * sizePercentage;
      
      this.selectionRect.setAttribute("x", viewBoxPos.x - rectSize/2);
      this.selectionRect.setAttribute("y", viewBoxPos.y - rectSize/2);
      
      if (this.deleteButton) {
        this.svg.removeChild(this.deleteButton);
        this.createDeleteButton(viewBoxPos.x + rectSize/2, viewBoxPos.y - rectSize/2);
      }
    }
    
    // Update frame data
    this.updateCurrentFrame();
    
    e.preventDefault();
  }

  handleMouseUp(e) {
    if (this.isDragging && this.dragTarget) {
      this.updateCurrentFrame();
    }
    
    this.isDragging = false;
    this.dragTarget = null;
  }

  // Add click event listeners to all players
  addPlayerClickHandlers() {
    this.players.forEach(player => {
      if (player.element) {
        player.element.addEventListener('click', () => {
          this.selectPlayer(player);
        });
      }
    });
  }

  //Override addPlayer to add click handler
  addPlayer(uniqueId, id, x, y, color) {
    const player = super.addPlayer(uniqueId, id, x, y, color);
    player.element.addEventListener('click', () => {
      this.selectPlayer(player);
    });
    
    // Add this player to all frames
    this.frames.forEach(frame => {
      if (!frame.players) {
        frame.players = [];
      }
      if (!frame.players.some(p => p.id === player.id)) {
        frame.players.push({
          id: player.id,
          uniqueId: uniqueId,
          x: player.logicalX,
          y: player.logicalY,
          color: player.color
        });
      }
    });
    
    return player;
  }

  setupDragHandlers() {
    this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  selectPlayer(player) {
    this.clearSelection();
    
    // If a player is clicked twice, deselect and return early
    if (this.selectedPlayer === player) {
      this.selectedPlayer = null;
      return;
    }
    
    // Set the new player as selected
    this.selectedPlayer = player;
    
    // Create selection indicator
    this.selectionRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    
    // Calculate position based on logical coordinates
    const viewBoxPos = this.logicalToViewBox(player.logicalX, player.logicalY);
    
    const sizePercentage = 0.11;
    const rectSize = Math.min(this.viewBoxWidth, this.viewBoxHeight) * sizePercentage;
    
    // Position and styling
    this.selectionRect.setAttribute("x", viewBoxPos.x - rectSize/2);
    this.selectionRect.setAttribute("y", viewBoxPos.y - rectSize/2);
    this.selectionRect.setAttribute("width", rectSize);
    this.selectionRect.setAttribute("height", rectSize);
    this.selectionRect.setAttribute("fill", "none");
    this.selectionRect.setAttribute("stroke", "#0000EE");
    this.selectionRect.setAttribute("stroke-width", "1");
    
    this.svg.appendChild(this.selectionRect);
    
    this.createDeleteButton(viewBoxPos.x + rectSize/2, viewBoxPos.y - rectSize/2);
  }

  /***********/
  /* DELETION */
  /**********/

  createDeleteButton(x, y) {
    this.deleteButton = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const buttonRadius = Math.min(this.viewBoxWidth, this.viewBoxHeight) * 0.02;
    
    // Create circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", buttonRadius);
    circle.setAttribute("fill", "#FF0000");
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "1");
    
    // Create X (two crossed lines)
    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    
    const offset = buttonRadius * 0.6; // Size of the X relative to circle
    
    line1.setAttribute("x1", x - offset);
    line1.setAttribute("y1", y - offset);
    line1.setAttribute("x2", x + offset);
    line1.setAttribute("y2", y + offset);
    line1.setAttribute("stroke", "black");
    line1.setAttribute("stroke-width", "1.5");
    
    line2.setAttribute("x1", x + offset);
    line2.setAttribute("y1", y - offset);
    line2.setAttribute("x2", x - offset);
    line2.setAttribute("y2", y + offset);
    line2.setAttribute("stroke", "black");
    line2.setAttribute("stroke-width", "1.5");
    
    // Add elements to group
    this.deleteButton.appendChild(circle);
    this.deleteButton.appendChild(line1);
    this.deleteButton.appendChild(line2);
    
    const handleDeleteClick = (e) => {
      e.stopPropagation();
      
      if (this.selectedPlayer) {
        this.deletePlayer(this.selectedPlayer);
      }
    };
    
    circle.addEventListener('click', handleDeleteClick);
    line1.addEventListener('click', handleDeleteClick);
    line2.addEventListener('click', handleDeleteClick);
    
    // Add to SVG
    this.svg.appendChild(this.deleteButton);
  }

  deletePlayer(player) {
    // Remove player's element from SVG
    if (player.element) {
      this.svg.removeChild(player.element);
    }
    
    // Remove player from players array
    const playerIndex = this.players.findIndex(p => p.id === player.id);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);
    }
    
    // Update all frames to remove this player
    this.frames.forEach(frame => {
      const playerDataIndex = frame.players.findIndex(p => p.id === player.id);
      if (playerDataIndex !== -1) {
        frame.players.splice(playerDataIndex, 1);
      }
    });
    
    this.clearSelection();

    api.deleteObject(player.uniqueId);
  }

  /**********************/
  /* FRAMES AND ANIMATION */
  /*********************/

  // Override playFrame to clear selection when switching frames
  playFrame(frameIndex, duration = 1000) {
    this.clearSelection();
    
    if (frameIndex >= this.frames.length) return;
    
    const frameData = this.frames[frameIndex];
    
    // Update frame number display
    const frameNumber = document.querySelector('.framenumber h3');
    frameNumber.textContent = `Frame ${frameData.id}`;
    
    // Add players back to this.players if they were removed
    if (!frameData.players || !frameData.ball) {
      console.error("Invalid frame data structure:", frameData);
      return;
    }
    
    frameData.players.forEach(playerData => {
      if (!this.players.some(p => p.id == playerData.id)) {
        this.addPlayer(playerData.uniqueId, playerData.id, playerData.x, playerData.y, playerData.color);
      }
    });
    
    // Continue with normal play frame logic
    super.playFrame(frameIndex, duration);
  }

  // Override nextFrame to clear selection
  nextFrame() {
    this.updateCurrentFrame();
    this.clearSelection();
    super.nextFrame();
  }

  // Override previousFrame to clear selection
  previousFrame() {
    this.updateCurrentFrame();
    this.clearSelection();
    super.previousFrame();
  }

  // Update the current frame with new positions
  updateCurrentFrame() {
    if (this.currentFrameIndex >= 0 && this.currentFrameIndex < this.frames.length) {
      const currentFrame = this.frames[this.currentFrameIndex];
      
      // Update player positions
      this.players.forEach(player => {
        let playerData = currentFrame.players.find(p => p.id === player.id);
        if (playerData) {
          playerData.x = player.logicalX;
          playerData.y = player.logicalY;
          if (!playerData.uniqueId && player.uniqueId) {
            playerData.uniqueId = player.uniqueId;
          }
        } else {
          // New player - add to this frame
          currentFrame.players.push({
            id: player.id,
            uniqueId: player.uniqueId,
            x: player.logicalX,
            y: player.logicalY,
            color: player.color
          });
        }
      });
      
      if (this.ball) {
        currentFrame.ball.x = this.ball.logicalX;
        currentFrame.ball.y = this.ball.logicalY;
      }
    }
  }

  // Override rewindAnimation to clear selection
  rewindAnimation() {
    this.clearSelection();
    super.rewindAnimation();
  }

  // Override playAnimation to clear selection
  playAnimation() {
    this.clearSelection();
    super.playAnimation();
  }

  /**********************/
  /* HEADER FUNCTIONALITY */
  /*********************/
  
  initializeTitleEdit() {
    const titleElement = document.getElementById('playTitle');
    const titleModal = document.getElementById('title-modal');
    const titleInput = document.getElementById('play-title-input');
    const saveButton = document.getElementById('save-title-button');
    const cancelButton = document.getElementById('cancel-title-button');
    const errorDiv = document.getElementById('title-error');
    
    // Make the title clickable
    titleElement.addEventListener('click', () => {
      titleInput.value = titleElement.textContent;
      titleModal.style.display = 'flex';
      titleInput.focus();
      checkTitleValidity();
    });
    
    // Validate the title for whitespace
    const checkTitleValidity = () => {
      const trimmedValue = titleInput.value.trim();
      
      if (trimmedValue === '') {
        errorDiv.style.visibility = 'visible';
        saveButton.disabled = true;
      } else {
        errorDiv.style.visibility = 'hidden';
        saveButton.disabled = false;
      }
    };

    titleInput.addEventListener('input', checkTitleValidity);
    
    cancelButton.addEventListener('click', () => {
      titleModal.style.display = 'none';
    });
    saveButton.addEventListener('click', () => {
      const newTitle = titleInput.value.trim();
      if (newTitle !== '') {
        titleElement.textContent = newTitle;
        titleModal.style.display = 'none';
        
        // SAVE PLAY TITLE TO DATABASE HERE
      }
    });
  }

  updateNavigationArrows() {
    const leftArrow = document.querySelector('.larrow');
    const rightArrow = document.querySelector('.rarrow');
    
    const newLeftArrow = leftArrow.cloneNode(true);
    const newRightArrow = rightArrow.cloneNode(true);
    
    leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
    rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);
    
    console.log("Adding a new event listener to left arrow");
    newLeftArrow.addEventListener('click', () => {
      if (this.currentFrameIndex > 0) {
        this.previousFrame();
      }
    });
    
    console.log("Adding a new event listener to right arrow");
    newRightArrow.addEventListener('click', () => {
      if (this.currentFrameIndex < this.frames.length - 1) {
        this.nextFrame();
      }
    });
  }

  /****************/
  /* FOOTER BUTTONS */
  /****************/

  // ADD PLAYERS BUTTON
  initializeAddPlayers() {
    const addPlayersButton = document.getElementById('add-players');
    addPlayersButton.addEventListener('click', () => {
      // Look for both colors and IDs
      let maxId = 0;
      let maxUniqueId = 0;
      let uniqueColors = [];

      this.players.forEach(player => {
        if(player.uniqueId > maxUniqueId){
          maxUniqueId = player.uniqueId;
        }
        if (player.id > maxId) {
          maxId = player.id;
        }
        if (!uniqueColors.includes(player.color)) {
          uniqueColors.push(player.color);
        }
      });

      this.addPlayer(maxUniqueId + 1, maxId + 1, 100, 100, uniqueColors[0]);
      this.addPlayer(maxUniqueId + 2, maxId + 2, 500, 100, uniqueColors[1]);
    });
  }

  // COLOR PICKER BUTTON
  initializeColorPicker() {
    const colorModal = document.getElementById('color-modal');
    const homeSelect = document.getElementById('home-color-select');
    const awaySelect = document.getElementById('away-color-select');
    const errorDiv = document.getElementById('color-error');
    const saveButton = document.getElementById('save-colors-button');
    const cancelButton = document.getElementById('cancel-colors-button');
    
    // Color mapping data
    const teamColorsMapping = {
      "#D72323": "red",
      "#FFBC0A": "yellow",
      "#04E762": "green",
      "#3993DD": "blue",
      "#C200FB": "purple"
    };
    
    const inverseColorMapping = {
      "red": "#D72323",
      "yellow": "#FFBC0A",
      "green": "#04E762",
      "blue": "#3993DD",
      "purple": "#C200FB"
    };

    let uniqueColors = [];
    
    // Add event listener for the color select button
    const colorSelectButton = document.getElementById('color-select');
    if (colorSelectButton) {
      colorSelectButton.addEventListener('click', () => {
        // Determine current colors by finding the first two unique colors
        uniqueColors = [];
        this.players.forEach(player => {
          if (!uniqueColors.includes(player.color)) {
            uniqueColors.push(player.color);
          }
        });
        
        let homeColor = teamColorsMapping[uniqueColors[0]];
        let awayColor = teamColorsMapping[uniqueColors[1]];
        
        // Set dropdown values
        for (let i = 0; i < homeSelect.options.length; i++) {
          if (homeSelect.options[i].value === homeColor) {
            homeSelect.selectedIndex = i;
            break;
          }
        }
        
        for (let i = 0; i < awaySelect.options.length; i++) {
          if (awaySelect.options[i].value === awayColor) {
            awaySelect.selectedIndex = i;
            break;
          }
        }
        colorModal.style.display = 'flex';
        checkDuplicateColors();
      });
    }
    
    // Function to check for duplicate colors
    const checkDuplicateColors = () => {
      const homeColor = homeSelect.value;
      const awayColor = awaySelect.value;
      
      if (homeColor === awayColor) {
        errorDiv.style.visibility = 'visible';
        saveButton.disabled = true;
      } else {
        errorDiv.style.visibility = 'hidden';
        saveButton.disabled = false;
      }
    };
    
    // Add event listeners for color change validation
    homeSelect.addEventListener('change', checkDuplicateColors);
    awaySelect.addEventListener('change', checkDuplicateColors);
    
    // Cancel button handler
    cancelButton.addEventListener('click', () => {
      colorModal.style.display = 'none';
    });
    
    // Save button handler
    saveButton.addEventListener('click', () => {
      const newHomeColor = inverseColorMapping[homeSelect.value];
      const newAwayColor = inverseColorMapping[awaySelect.value];
      let oldHomeColor = uniqueColors[0];
      let oldAwayColor = uniqueColors[1];
      
      // Update player colors
      this.updateTeamColors(oldHomeColor, newHomeColor, oldAwayColor, newAwayColor);
      
      // Hide the modal
      colorModal.style.display = 'none';
    });
  }
  
  updateTeamColors(oldHomeColor, newHomeColor, oldAwayColor, newAwayColor) {
    this.players.forEach(player => {
      if (player.color === oldHomeColor) {
        player.color = newHomeColor;
        if (player.element) {
          player.element.setAttribute('fill', newHomeColor);
        }
      } else if (player.color === oldAwayColor) {
        player.color = newAwayColor;
        if (player.element) {
          player.element.setAttribute('fill', newAwayColor);
        }
      }
    });
  }

  // ADD FRAME BUTTON
  initializeAddFrame() {
    const addFrameButton = document.getElementById('add-frame');
    if (addFrameButton) {
      addFrameButton.addEventListener('click', () => {
        this.addNewFrame();
      });
    }
  }
  
  addNewFrame() {
    // Save current frame state first
    this.updateCurrentFrame();
    
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame) return;
    
    // Create a copy of the current frame
    const newFrame = {
      id: `${this.currentFrameIndex + 2}`,
      players: JSON.parse(JSON.stringify(currentFrame.players)),
      ball: { 
        x: this.ball.logicalX, 
        y: this.ball.logicalY 
      }
    };
    
    this.frames.splice(this.currentFrameIndex + 1, 0, newFrame);
    this.currentFrameIndex++;
    
    const frameNumber = document.querySelector('.framenumber h3');
    frameNumber.textContent = `Frame ${this.currentFrameIndex + 1}`;
  }

  // REMOVE FRAME BUTTON
  initializeRemoveFrame() {
    const removeFrameButton = document.getElementById('remove-frame');
    if (removeFrameButton) {
      removeFrameButton.addEventListener('click', () => {
        this.removeCurrentFrame();
      });
    }
  }
  
  removeCurrentFrame() {
    if (this.frames.length <= 1) {
      alert("Cannot remove the last frame. At least one frame must exist.");
      return;
    }
  
    this.clearSelection();
    this.frames.splice(this.currentFrameIndex, 1);
  
    if (this.currentFrameIndex >= this.frames.length) {
      this.currentFrameIndex = this.frames.length - 1;
    }
    this.playFrame(this.currentFrameIndex, 0);
  
    // Update the frame number text
    const frameNumber = document.querySelector('.framenumber h3');
    frameNumber.textContent = `Frame ${this.currentFrameIndex + 1}`;

    this.updateNavigationArrows();
  }

  /********************/
  /* PREVIEW GENERATION */
  /********************/
  
  generatePreview() {
    this.currentFrameIndex = 0;
    this.playFrame(0, 0);
    
    // Make sure all elements are fully rendered
    this.forceRepositionAll();
    
    this.players.forEach(player => {
      if (player.element) {
        player.element.setAttribute("r", "20");
      }
    });
    
    if (this.ball && this.ball.element) {
      this.ball.element.setAttribute("r", "10");
    }
    
    return this.svg;
  }
  
  capturePreviewImage() {
    return new Promise((resolve) => {
      const svg = this.generatePreview();
      
      // Add a small delay to draw players and ball
      setTimeout(() => {
        // Get the SVG markup as a string
        const svgData = new XMLSerializer().serializeToString(svg);
        
        const canvas = document.createElement('canvas');
        const rect = svg.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const img = new Image();
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const debugImg = document.createElement('img');
          debugImg.src = canvas.toDataURL('image/png');
          
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          }, 'image/png');
        };
        
        img.onerror = (e) => {
          console.error("Error loading SVG image:", e);
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      }, 100);
    });
  }

  /****************/
  /* LEAVING A PLAY */
  /****************/
  
  async leavePlay() {
    try {
      // Get play title
      const playTitle = document.getElementById('playTitle').textContent;
      
      // BROKEN CODE - GENERATES AN IMAGE PREVIEW OF THE PLAY AS A .PNG
      // Capture the preview image as a blob
      // const imageBlob = await this.capturePreviewImage();
      // // Generate a temporary filename just for the upload
      // const timestamp = new Date().getTime();
      // const filename = `play_${this.playId}_${timestamp}.png`;
      // // Save the image to the server
      // const savedImage = await api.savePlayPreviewImage(imageBlob, filename);
      // if (!savedImage || !savedImage.success) {
      //   console.error("Error saving preview image:", savedImage ? savedImage.error : "No response");
      //   return;
      // }
      // // Get the path returned from the server
      // const imagePath = savedImage.previewUrl;
      const imagePath = "images/fakepreview.png";
      
      // Color Mapping to save to database
      const teamColorsMapping = {
        "#D72323": "red",
        "#FFBC0A": "yellow",
        "#04E762": "green",
        "#3993DD": "blue",
        "#C200FB": "purple"
      };

      // First check if the play exists
      console.log("Play ID:", this.playId);
      let existingPlay = false;
      if(this.playId !== "default"){
        existingPlay = await api.getPlayById(this.playId)
      }
      if (existingPlay) {
        console.log("Found play by ID:", this.playId);
        // Play exists, update it with the new preview image path
        await api.updatePlay(this.playId, playTitle, imagePath);
        
        // Update frames
        for (const frame of this.frames) {
          const existingFrame = await api.getFrameById(frame.id);
          
          if (existingFrame) {
            // Frame exists, update it
            await api.updateFrame(frame.id, frame.ball.x, frame.ball.y);
            
            // Update players
            const existingObjects = await api.getFrameObjects(frame.id);
            console.log("All existing objects in existing frame:", existingObjects);
            console.log("Frame.players:", frame.players);
            for (const player of frame.players) {
              if (!player.uniqueId) {
                console.error("Player missing uniqueId:", player);
                continue;
              }
              const existingObject = existingObjects.find(obj => obj.id == player.uniqueId);
              console.log("Existing object in existing frame:", existingObject);
              if (existingObject) {
                // Player exists, update it
                await api.updateObject(player.uniqueId, player.id, player.x, player.y, teamColorsMapping[player.color]);
              } else {
                // Player doesn't exist, create it
                await api.createNewObject(player.id, player.x, player.y, teamColorsMapping[player.color], frame.id);
              }
            }
          } else {
            // Frame doesn't exist, create it
            await api.createNewFrame(frame.id, frame.ball.x, frame.ball.y);
            
            // Create players
            for (const player of frame.players) {
              await api.createNewObject(player.id, player.x, player.y, teamColorsMapping[player.color], frame.id);
            }
          }
        }
      } else {

        const title = document.getElementById("playTitle");
        // Play doesn't exist, create it with the preview image path
        //Generate a random ID
        await api.createNewPlay(title.textContent, imagePath);
        
        // Create frames and players
        for (const frame of this.frames) {
          const frameObj = await api.createNewFrame(frame.ball.x, frame.ball.y);
          console.log(frameObj);
          
          for (const player of frame.players) {
            await api.createNewObject(player.id, player.x, player.y, teamColorsMapping[player.color], frameObj.id);
          }
        }
      }
      
      // Redirect to plays list
      window.location.href = '/myplays';
    } catch (error) {
      console.error('Error saving play:', error);
      alert('There was a problem saving your play. Please try again.');
    }
  }
}

// Initialization logic to determine which file we're on and which field to create
async function initApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const playId = urlParams.get('playId') || 'default';
  
  try {
    // Check if we're on the editing page
    const isEditPage = window.location.href.includes('createplay');

    let field;
    
    if (isEditPage) {
      // Verify the user is a coach if on edit page
      try {
        const currentUser = await api.getCurrentUser();
        const isCoach = currentUser && currentUser.hasOwnProperty('coach_code');
        
        if (isCoach) {
          field = new EditableField("#field-container", playId);
        } else {
          // Redirect non-coaches away from the edit page
          window.location.href = '/viewplay?playId=' + playId;
          return;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        // Default to view-only if we can't determine role
        window.location.href = '/viewplay?playId=' + playId;
        return;
      }
    } else {
      // We're on the viewing page, use the base Field class
      field = new Field("#field-container", playId);
    }
    
    await field.initialize();
    await field.setupFormation();
    await field.setupAnimationFrames();
    field.setupAnimation();
    
    // Display the first frame
    field.playFrame(0, 0);
    
    // Setup leave button for coaches
    if (isEditPage) {
      const leaveButton = document.querySelector("#leaveButton");
      if (leaveButton) {
        leaveButton.addEventListener('click', () => {
          field.leavePlay();
        });
      }
    }

  } catch (error) {
    console.error("Failed to initialize application:", error);
    alert("There was a problem loading the play. Please try again later.");
  }
  
}

// Start the application
initApp();