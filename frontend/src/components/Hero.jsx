import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Hero = ({ about }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!about?.roles || about.roles.length === 0) return;

    const currentRole = about.roles[roleIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentRole) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % about.roles.length);
      } else {
        setText(currentRole.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, roleIndex, about]);

  if (!about) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
        <motion.div 
          className="flex-1 text-center md:text-left space-y-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium tracking-wide">
            HELLO, I'M
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold">
            {about.name}
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold h-10">
            A <span className="gradient-text">{text}</span>
            <span className="animate-pulse">|</span>
          </h2>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
            <a href="#projects" className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
              View My Work
            </a>
            <a href="/resume.pdf" target="_blank" className="px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
              Download Resume
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            {about.photo_url ? (
              <img 
                src={about.photo_url?.startsWith('http') ? about.photo_url : `http://localhost:8000${about.photo_url}`}
                alt={about.name} 
                className="relative z-10 w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-2xl"
              />
            ) : (
              <div className="relative z-10 w-full h-full bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800">
                <span className="text-4xl text-gray-400">No Photo</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
