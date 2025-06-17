import { Field } from './animation.js';
import api from './APIClient.js';

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
  initialize() {

    const playButton = document.getElementById('playButton');
    const rewindButton = document.getElementById('rewindButton');
    
    if (playButton && rewindButton) {
      const playClone = playButton.cloneNode(true);
      const rewindClone = rewindButton.cloneNode(true);
      
      playButton.parentNode.replaceChild(playClone, playButton);
      rewindButton.parentNode.replaceChild(rewindClone, rewindButton);
    }
    
    // Now call the parent's initialize
    super.initialize();
    
    // Add our own event listeners
    const newPlayButton = document.getElementById('playButton');
    const newRewindButton = document.getElementById('rewindButton');
    
    if (newPlayButton) {
      newPlayButton.addEventListener('click', (e) => {
        console.log("EditableField play button pressed!");
        e.stopPropagation();
        this.playAnimation();
      });
    }
    
    if (newRewindButton) {
      newRewindButton.addEventListener('click', (e) => {
        console.log("EditableField rewind button pressed!");
        e.stopPropagation();
        this.rewindAnimation();
      });
    }

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

  // Forcibly repositions all elements based on their logical coordinates
  forceRepositionAll() {
    // Reposition all players based on their logical coordinates
    this.players.forEach(player => {
      const viewBoxPos = this.logicalToViewBox(player.logicalX, player.logicalY);
      player.element.setAttribute("cx", viewBoxPos.x);
      player.element.setAttribute("cy", viewBoxPos.y);
      player.x = viewBoxPos.x;
      player.y = viewBoxPos.y;
    });
    
    // Reposition the ball
    if (this.ball) {
      const viewBoxPos = this.logicalToViewBox(this.ball.logicalX, this.ball.logicalY);
      this.ball.element.setAttribute("cx", viewBoxPos.x);
      this.ball.element.setAttribute("cy", viewBoxPos.y);
      this.ball.x = viewBoxPos.x;
      this.ball.y = viewBoxPos.y;
    }
    
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
    this.dragTarget.element.setAttribute('cx', viewBoxPos.x);
    this.dragTarget.element.setAttribute('cy', viewBoxPos.y);
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
    super.addPlayer(uniqueId, id, x, y, color);
    const player = this.players.find(p => p.id === id);
    if (player.element) {
      player.element.addEventListener('click', () => {
        this.selectPlayer(player);
      });
    }
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
      } else {
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
  }

   /**********************/
  /* FRAMES AND ANIMATION */
   /*********************/

  // Different playFrame than animation.js
  playFrame(frameIndex, duration = 1000) {
    if (frameIndex >= this.frames.length) return;
    
    const frameData = this.frames[frameIndex];
    
    // Update frame number display
    const frameNumber = document.querySelector('.framenumber h3');
    frameNumber.textContent = `Frame ${frameData.id}`;
    console.log("Frame Data", frameData)
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
    
    // Update player positions
    frameData.players.forEach(playerData => {
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
    
    // Update ball position
    if (this.ball && this.ball.element && frameData.ball) {
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

  // Different nextFrame than animation.js
  nextFrame() {
    this.clearSelection();
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.playFrame(this.currentFrameIndex, 500);
    }
  }

  //Different previousFrame than animation.js
  previousFrame() {
    this.clearSelection();
    if (this.currentFrameIndex > 0) {
      this.currentFrameIndex--;
      this.playFrame(this.currentFrameIndex, 500);
    }
  }

  // Update the current frame with new positions
  updateCurrentFrame() {
    if (this.currentFrameIndex >= 0 && this.currentFrameIndex < this.frames.length) {
      const currentFrame = this.frames[this.currentFrameIndex];
      console.log("currentFrame:", currentFrame);
      // Update player positions
      this.players.forEach(player => {
        const playerData = currentFrame.players.find(p => p.id === player.id);
        if (playerData) {
          playerData.x = player.logicalX;
          playerData.y = player.logicalY;
        }
      });
      
      // Update ball position
      if (this.ball) {
        currentFrame.ball.x = this.ball.logicalX;
        currentFrame.ball.y = this.ball.logicalY;
      }
    }
  }

  setupAnimation() {
    // Only call these two methods, skip the event binding in the parent class
    this.setupAnimationFrames();
    this.setupNavigation();
    
    // Update frame number display
    const frameNumber = document.querySelector('.framenumber h3');
    if (frameNumber) {
      frameNumber.textContent = 'Frame 1';
    }
  }

  async setupAnimationFrames() {
    this.frames = [];
    
    try {
      const apiFrames = await api.getPlayFrames(this.playId);
      console.log("API Frames:", apiFrames);
      
      for (const apiFrame of apiFrames) {
        try {
          const frameObjects = await api.getFrameObjects(apiFrame.id);
          console.log("Frame objects for frame", apiFrame.id, frameObjects);
          
          const frameData = {
            id: apiFrame.id,
            players: frameObjects.map(obj => ({
              id: String(obj.player_id),
              x: obj.object_x,
              y: obj.object_y,
              color: obj.color
            })),
            ball: { 
              x: apiFrame.ball_x, 
              y: apiFrame.ball_y 
            }
          };
          
          console.log("FRAME DATA: ", frameData)
          this.frames.push(frameData);
        } catch (frameError) {
          console.error(`Error processing frame ${apiFrame.id}:`, frameError);
        }
      }
      
      console.log("Final processed frames:", this.frames);
      
      if (this.frames.length === 0) {
        this.addDefaultFrame();
      }
    } catch (error) {
      console.error("Error setting up animation frames:", error);
      this.addDefaultFrame();
    }
  }

  // Separate playAnimation from animation.js
  playAnimation() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Reset to first frame
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
    
    this.clearSelection();
    playSequence();
  }

  rewindAnimation() {
    super.rewindAnimation();
    this.clearSelection();
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
    
    newLeftArrow.addEventListener('click', () => {
      if (this.currentFrameIndex > 0) {
        this.previousFrame();
      }
    });
    
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
  initializeAddPlayers () {
    const colorSelectButton = document.getElementById('add-players');
    colorSelectButton.addEventListener('click', () => {
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
    addFrameButton.addEventListener('click', () => {
      this.addNewFrame();
    });
  }
  addNewFrame() {
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame) return;
    
    // Create a copy of the current frame
    const newFrame = {
      players: currentFrame.players.map(player => ({ 
        id: player.id, 
        x: player.x, 
        y: player.y 
      })),
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
    removeFrameButton.addEventListener('click', () => {
      this.removeCurrentFrame();
    });
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
    // Show first frame
    this.currentFrameIndex = 0;
    this.playFrame(0, 0);
    this.resize();
    
    return this.svg;
  }

  capturePreviewImage() {
    const svg = this.generatePreview();
    
    // Get the SVG markup as a string
    const svgData = new XMLSerializer().serializeToString(svg);
    
    // Create a canvas with the same dimensions
    const canvas = document.createElement('canvas');
    const rect = svg.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Create an image from the SVG string
    const img = new Image();
    // Convert SVG to a data URL
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve) => {
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pngData = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(pngData);
      };
      img.src = url;
    });
  }

   /****************/
  /* LEAVING A PLAY */
   /****************/
  
  leavePlay() {
    let playPreview = null;

    const playTitle = document.getElementById('playTitle').textContent;

    this.capturePreviewImage().then((pngData) => {
      this.playPreview = pngData;
    });

    console.log("Play Title:", playTitle);
    const id = this.playId;
    api.getPlayById(id).then((response) => {
      if (response) {
        console.log("Found play by ID:", playId);
        // Play exists, update it
        api.updatePlay(id, playTitle, playPreview);
        // Update frames after checking that they exist
        this.frames.forEach((frame) => {
          api.getFrameById(frame.id).then((response) => {
            if (response) {
              // Frame exists, update it
              api.updateFrame(frame.id, frame.ball.x, frame.ball.y);
              
              for (const player of frame.players) {
                // Check if this player already exists in the frame
                const existingObject = existingObjects.find(obj => obj.id == player.uniqueId);
                
                if (existingObject) {
                  // Object exists, update it
                  api.updateFrameObject(player.uniqueId, player.id, player.x, player.y, player.color);
                } else {
                  // Object doesn't exist, create it
                  api.createNewObject(player.uniqueId, player.id, player.x, player.y, player.color);
                }
              }
            } else {
              // Frame doesn't exist, create it
              api.createNewFrame(frame.id, frame.ball.x, frame.ball.y);
              frame.players.forEach((player) => {
                api.createNewObject(player.uniqueId, player.id, player.x, player.y, player.color).then((response) => {
                  if (response) {
                    console.log('Frame object created successfully');
                  } else {
                    console.error('Error creating frame object:', response.statusText);
                  }
                }).catch((error) => {
                  console.error('Error:', error);
                });
              });
            }
          }).catch((error) => {
            console.error('Error:', error);
          });
        });
      } else {
        // Play doesn't exist, create a new one
        api.createNewPlay(id, playTitle, playPreview).then((response) => {
          // If play was new, frames and objects must be created too
          this.frames.forEach((frame) => { 
            api.createNewFrame(frame.id, frame.ball.x, frame.ball.y).then((response) => {
              if (response) {
                console.log('Frame created successfully');
              } else {
                console.error('Error creating frame:', response.statusText);
              }
            }).catch((error) => {
              console.error('Error:', error);
            });

            for (const player of frame.players) {
              api.createNewObject(player.uniqueId, player.id, player.x, player.y,player.color);
            }

          });
          if (response) {
            console.log('Play created successfully');
          }
          else {
            console.error('Error creating play:', response.statusText);
          }
        });
      }
    }).catch((error) => {
      console.error('Error:', error);
    });
    //REDIRECT TO /myplays
    //window.location.href = '/myplays';
  }
}

 /********************/
/*  CODE STARTS HERE  */
 /********************/

// Clear the pregenerated uneditable field
document.querySelector("#field-container").innerHTML = "";

// Get playId from params if it exists
const urlParams = new URLSearchParams(window.location.search);
const playId = urlParams.get('playId') || 'default';

// Create editable field
const field = new EditableField("#field-container", playId);
field.initialize();
field.setupFormation();
field.setupAnimation();

//Create leave button
const leaveButton = document.querySelector("#leaveButton");
leaveButton.addEventListener('click', (e) => {
  field.leavePlay();
});