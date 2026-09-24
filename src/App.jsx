import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  
  // Track mouse coordinates for drawing
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, active: false });
  // Current smoothed angle
  const currentAngle = useRef(-Math.PI / 2); // Start pointing UP

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const framesRef = useRef([]);
  const centerFrameRef = useRef(null);
  
  // UI Hover state
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // 1. Preload Images
    let loadedCount = 0;
    const totalFrames = 64;
    const frames = [];

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalFrames + 1) { // 64 frames + center
        setImagesLoaded(true);
      }
    };

    // Load center frame
    const centerImg = new Image();
    centerImg.src = '/frames/center.webp';
    centerImg.onload = checkAllLoaded;
    centerFrameRef.current = centerImg;

    // Load 64 frames
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const numStr = i.toString().padStart(4, '0');
      img.src = `/frames/${numStr}.webp`;
      img.onload = checkAllLoaded;
      frames.push(img);
    }
    framesRef.current = frames;
  }, []);

  const isHoveredRef = useRef(false);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    // 2. Set up event listeners for mouse tracking
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
        mouse.current.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.current.active = false;
    };
    
    // Smooth cursor trailing using refs so they persist
    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    
    let animId;
    const updateCursor = () => {
      if (mouse.current.active) {
        dotX += (mouse.current.x - dotX) * 0.5;
        dotY += (mouse.current.y - dotY) * 0.5;
        
        ringX += (mouse.current.x - ringX) * 0.15;
        ringY += (mouse.current.y - ringY) * 0.15;
      }

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${dotX}px, ${dotY}px)`;
        cursorDotRef.current.style.opacity = mouse.current.active ? 1 : 0;
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate(${ringX}px, ${ringY}px) scale(${isHoveredRef.current ? 1.5 : 1})`;
        cursorRingRef.current.style.opacity = mouse.current.active ? 1 : 0;
      }
      animId = requestAnimationFrame(updateCursor);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    animId = requestAnimationFrame(updateCursor);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    // 3. Canvas Renderer
    if (!imagesLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
    
    let animationFrameId;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const lerpAngle = (start, end, factor) => {
      let diff = end - start;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      return start + diff * factor;
    };

    const drawCover = (img) => {
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      // Draw background color to clear
      ctx.fillStyle = '#af161a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const render = () => {
      const faceCenterX = canvas.width / 2;
      const faceCenterY = canvas.height / 2;
      
      const dx = mouse.current.x - faceCenterX;
      const dy = mouse.current.y - faceCenterY;
      
      const distanceToFace = Math.sqrt(dx * dx + dy * dy);
      const deadzoneRadius = Math.min(canvas.width, canvas.height) * 0.12;

      let targetAngle = Math.atan2(dy, dx);
      
      // Smooth the angle
      currentAngle.current = lerpAngle(currentAngle.current, targetAngle, 0.26);
      
      if (distanceToFace < deadzoneRadius) {
        drawCover(centerFrameRef.current);
      } else {
        // Map angle to frame
        let normalizedAngle = (currentAngle.current + Math.PI / 2) % (2 * Math.PI);
        if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
        
        let frameIndex = Math.round((normalizedAngle / (2 * Math.PI)) * 64) % 64;
        drawCover(framesRef.current[frameIndex]);
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded]);

  const handleHoverIn = () => setIsHovered(true);
  const handleHoverOut = () => setIsHovered(false);

  return (
    <div className="app-container">
      <div className="custom-cursor-dot" ref={cursorDotRef}></div>
      <div className={`custom-cursor-ring ${isHovered ? 'hovered' : ''}`} ref={cursorRingRef}></div>
      
      <canvas ref={canvasRef} className="hero-canvas"></canvas>
      
      <header className="hero-header">
        <nav className="nav-pill">
          <a href="#work" onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>WORK</a>
          <a href="#about" onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>ABOUT</a>
          <a href="#contact" onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>CONTACT</a>
        </nav>
      </header>

      <main className="hero-content">
        <div className="hero-text-block">
          <p className="greeting">Hi, I'm</p>
          <h1 className="name">Akshita</h1>
          <p className="bio">
            Crafting award-winning digital experiences. 
            I specialize in full-stack development, bringing 
            creative visions to life with zero-lag performance.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>
              Resume <span className="arrow">→</span>
            </button>
            <button className="btn btn-secondary" onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>
              Let's Talk
            </button>
          </div>
        </div>
      </main>

      {!imagesLoaded && (
        <div className="loading-screen">
          <p>Loading Experience...</p>
        </div>
      )}
    </div>
  );
}

export default App;
