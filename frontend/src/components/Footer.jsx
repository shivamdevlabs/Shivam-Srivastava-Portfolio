import { FiGithub, FiLinkedin, FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaBehance } from 'react-icons/fa';

const Footer = ({ about }) => {
  if (!about) return null;

  const socialLinks = about.social_links || {};

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-6 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold gradient-text">{about.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Building digital experiences that matter.</p>
        </div>
        
        <div className="flex items-center space-x-6">
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
              <FiGithub size={24} />
            </a>
          )}
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
              <FiLinkedin size={24} />
            </a>
          )}
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
              <FiInstagram size={24} />
            </a>
          )}
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
              <FiFacebook size={24} />
            </a>
          )}
          {socialLinks.behance && (
            <a href={socialLinks.behance} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
              <FaBehance size={24} />
            </a>
          )}
        </div>
      </div>
      <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} {about.name}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
