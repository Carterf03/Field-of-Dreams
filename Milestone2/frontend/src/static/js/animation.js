// import { animate } from 'https://cdn.jsdelivr.net/npm/motion@10.16.2/dist/motion.es.js';

class Player {
  constructor(id, x, y, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.logicalX = x;
    this.logicalY = y;
    this.color = color;
    this.element = null;
  }
  
  render(container) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", this.y);
    circle.classList.add("player");
    circle.setAttribute("fill", this.color);
    circle.setAttribute("id", `player-${this.id}`);
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "2");
    
    container.appendChild(circle);
    this.element = circle;
    return circle;
  }
}

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.logicalX = x;
    this.logicalY = y;
    this.element = null;
  }

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
  
class Field {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.svg = null;
    this.players = [];
    this.ball = null;
    this.aspectRatio = 2;
    this.frames = [];
    this.currentFrameIndex = 0;
    this.isPlaying = false;
  }
  setupAnimationFrames() {
    this.frames.push({
      players: this.players.map(p => ({ id: p.id, x: p.logicalX, y: p.logicalY })),
      ball: { x: this.ball.logicalX, y: this.ball.logicalY }
    });
    
    this.frames.push({
      players: [
        { id: 1, x: 100, y: 220 },
        { id: 2, x: 170, y: 180 },
        { id: 3, x: 350, y: 130 },
        { id: 4, x: 300, y: 180 },
        { id: 5, x: 400, y: 220 },
        { id: 6, x: 120, y: 280 },
        { id: 7, x: 200, y: 320 },
        { id: 8, x: 320, y: 340 },
        { id: 9, x: 280, y: 260 },
        { id: 10, x: 380, y: 270 }
      ],
      ball: { x: 300, y: 200 }
    });
    
    // Frame 3 - Final positions
    this.frames.push({
      players: [
        { id: 1, x: 80, y: 250 },
        { id: 2, x: 150, y: 200 },
        { id: 3, x: 400, y: 150 },
        { id: 4, x: 350, y: 200 },
        { id: 5, x: 450, y: 250 },
        { id: 6, x: 100, y: 320 },
        { id: 7, x: 180, y: 350 },
        { id: 8, x: 350, y: 350 },
        { id: 9, x: 320, y: 280 },
        { id: 10, x: 420, y: 300 }
      ],
      ball: { x: 350, y: 150 }
    });
  }
  initialize() {
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
  }

  resize() {
    this.svg.style.width = "100%";
    this.svg.style.height = "100%";
    
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isLandscape) {
      this.viewBoxWidth = 1000;
      this.viewBoxHeight = 500;
    } else {
      this.viewBoxWidth = 500;
      this.viewBoxHeight = 1000;
    }
    
    this.svg.setAttribute("viewBox", `0 0 ${this.viewBoxWidth} ${this.viewBoxHeight}`);
    this.container.offsetHeight;
  
    this.repositionObjects(isLandscape);
  }

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
        player.element.setAttribute("cx", viewBoxX);
        player.element.setAttribute("cy", viewBoxY);
      }
    });

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

  addPlayer(id, x, y, color) {
    const player = new Player(id, 0, 0, color);
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
    
    player.render(this.svg);
    this.players.push(player);
    return player;
  }

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

  setupFormation() {
    this.players = [];
    
    const teamColors = {
      red: "#D72323",
      yellow: "#FFBC0A",
      green: "#04E762",
      blue: "#3993DD",
      purple: "#C200FB",
    };
    
    this.addPlayer(1, 150, 200, teamColors.red);
    this.addPlayer(2, 200, 150, teamColors.yellow);
    this.addPlayer(3, 300, 150, teamColors.green);
    this.addPlayer(4, 250, 200, teamColors.blue);
    this.addPlayer(5, 350, 200, teamColors.purple);
    
    this.addPlayer(6, 150, 250, teamColors.red);
    this.addPlayer(7, 200, 300, teamColors.yellow);
    this.addPlayer(8, 300, 300, teamColors.green);
    this.addPlayer(9, 250, 250, teamColors.blue);
    this.addPlayer(10, 350, 250, teamColors.purple);

    this.ball = this.addBall(250, 250);
  }

  playFrame(frameIndex, duration = 1000) {
    if (frameIndex >= this.frames.length) return;
    
    const frameData = this.frames[frameIndex];
    
    // Update frame number display
    const frameNumber = document.querySelector('.framenumber h3');
    if (frameNumber) {
      frameNumber.textContent = `Frame ${frameIndex + 1}`;
    }
    
    frameData.players.forEach(playerData => {
      const player = this.players.find(p => p.id === playerData.id);
      if (player && player.element) {
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
        
        Motion.animate(player.element, {
          cx: viewBoxX,
          cy: viewBoxY
        }, { duration: duration / 1000, easing: 'ease-in-out' });
      }
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
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for animation to complete
      }
      this.isPlaying = false;
    };
    
    playSequence();
  }
  rewindAnimation() {
    this.currentFrameIndex = 0;
    this.isPlaying = false;
    
    this.playFrame(0, 500);
    
    const frameNumber = document.querySelector('.framenumber h3');
    if (frameNumber) {
      frameNumber.textContent = 'Frame 1';
    }
  }
  setupAnimation() {
    this.setupAnimationFrames();
    
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
}
  
document.addEventListener('DOMContentLoaded', () => {
  const field = new Field("#field-container");
  field.initialize();
  field.setupFormation();
  field.setupAnimation();
  
  const header = document.querySelector('header');
  const menuToggle = document.getElementById('menuToggle');
  const toggleSpan = menuToggle.querySelector('span');
  
  menuToggle.addEventListener('click', () => {
    header.classList.toggle('menu-hidden');
    
    if (header.classList.contains('menu-hidden')) {
      toggleSpan.textContent = '+';
    } else {
      toggleSpan.textContent = '−';
    }
  });
});