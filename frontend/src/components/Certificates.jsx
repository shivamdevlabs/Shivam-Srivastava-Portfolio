import { motion } from 'framer-motion';
import { FiAward, FiExternalLink } from 'react-icons/fi';

const Certificates = ({ certificates }) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <section id="certificates" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">My <span className="gradient-text">Certifications</span></h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass p-6 rounded-2xl flex flex-col group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <FiAward size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">{cert.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-1">{cert.issued_by}</p>
              
              <a 
                href={cert.pdf_url?.startsWith('http') ? cert.pdf_url : `http://localhost:8000${cert.pdf_url}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <span>View Certificate</span>
                <FiExternalLink />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
