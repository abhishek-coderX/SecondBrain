// import { useNavigate } from "react-router-dom";

// export const LandingPage = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="container mx-auto px-4 py-16">
//         <div className="text-center">
//           <h1 className="text-6xl font-bold text-gray-900 mb-6">
//             Welcome to <span className="text-blue-600">ContentHub</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
//             Organize, save, and manage all your favorite content in one place. 
//             From tweets to videos, keep everything accessible and organized.
//           </p>
//           <div className="space-x-4">
//             <button 
//               onClick={() => navigate('/auth')}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
//             >
//               Get Started
//             </button>
//             <button 
//               onClick={() => navigate('/auth')}
//               className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border border-blue-600 transition-colors"
//             >
//               Sign In
//             </button>
//           </div>
//         </div>
        
        
//       </div>
//     </div>
//   );
// };


import React from 'react';
import { useNavigate } from "react-router-dom";

const Icon = ({ name, className }) => {
  const icons = {
    brainCircuit: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5a3 3 0 1 0-5.993.142"/><path d="M12 5a3 3 0 1 1 5.993.142"/><path d="M15 13a3 3 0 1 0-5.993.142"/><path d="M15 13a3 3 0 1 1 5.993.142"/><path d="M5 13a3 3 0 1 0-5.993.142"/><path d="M5 13a3 3 0 1 1 5.993.142"/><path d="M12 21a3 3 0 1 0-5.993.142"/><path d="M12 21a3 3 0 1 1 5.993.142"/><path d="M12 5a3 3 0 0 0-3 3v2c0 1.105.895 2 2 2h2a2 2 0 0 0 2-2V8a3 3 0 0 0-3-3Z"/><path d="M15 13a3 3 0 0 0-3 3v2c0 1.105.895 2 2 2h2a2 2 0 0 0 2-2v-2a3 3 0 0 0-3-3Z"/><path d="M5 13a3 3 0 0 0-3 3v2c0 1.105.895 2 2 2h2a2 2 0 0 0 2-2v-2a3 3 0 0 0-3-3Z"/><path d="M12 21a3 3 0 0 0-3-3h-2a2 2 0 0 0-2 2v2a3 3 0 0 0 3 3Z"/><path d="M12 21a3 3 0 0 1 3-3h2a2 2 0 0 1 2 2v2a3 3 0 0 1-3 3Z"/></svg>),
    zap: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
    search: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
    share: (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>),
  };
  return icons[name] || null;
};

const NeuralNetworkCanvas = () => {
    const canvasRef = React.useRef(null);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        class Particle {
            constructor(x, y, dx, dy, radius, color) { this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.radius = radius; this.color = color; }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill(); }
            update() { if (this.x > canvas.width || this.x < 0) this.dx = -this.dx; if (this.y > canvas.height || this.y < 0) this.dy = -this.dy; this.x += this.dx; this.y += this.dy; this.draw(); }
        }
        const init = () => {
            particles = [];
            let numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let radius = Math.random() * 1.5 + 1;
                let x = Math.random() * (canvas.width - radius * 2) + radius;
                let y = Math.random() * (canvas.height - radius * 2) + radius;
                let dx = (Math.random() - 0.5) * 0.5;
                let dy = (Math.random() - 0.5) * 0.5;
                particles.push(new Particle(x, y, dx, dy, radius, 'rgba(107, 114, 128, 0.7)'));
            }
        };
        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(107, 114, 128, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) { particles[i].update(); }
            connect();
        };
        init();
        animate();
        return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', resizeCanvas); };
    }, []);
    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export const LandingPage = () => {
  const navigate = useNavigate();
  
  const features = [
    { icon: 'zap', title: 'Effortless Capture', description: 'Save articles, tweets, and videos from anywhere on the web with a single click.' },
    { icon: 'brainCircuit', title: 'Intelligent Organization', description: 'ContentHub automatically categorizes and tags your content, creating a web of knowledge.' },
    { icon: 'search', title: 'Powerful Search', description: 'Instantly find any piece of information you\'ve saved with our semantic search.' },
    { icon: 'share', title: 'Connect & Share', description: 'Collaborate on collections and share your curated knowledge with others.' },
  ];

  return (
    <div className="bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-30 bg-gray-900/70 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Icon name="brainCircuit" className="h-8 w-8 text-blue-400" />
              <span className="ml-3 text-2xl font-bold">ContentHub</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Features</a>
              <button onClick={() => navigate('/auth')} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sign In</button>
              <button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="relative text-center py-24 sm:py-32 lg:py-48 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <NeuralNetworkCanvas />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-900"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-400">
              Your Digital Second Brain, Reimagined.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Stop losing brilliant ideas and valuable content. ContentHub is the effortless way to capture, organize, and rediscover your digital world.
            </p>
            <div className="mt-10">
              <button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                Build Your Second Brain for Free
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-gray-900 border-t border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">A Smarter Way to Manage Knowledge</h2>
              <p className="mt-4 text-lg text-gray-400">Everything you need to turn digital clutter into a clear, connected knowledge base.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/60 transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500 text-white mb-4">
                    <Icon name={feature.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ContentHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
