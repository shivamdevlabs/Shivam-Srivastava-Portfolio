import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useState } from 'react';
import api from '../services/api';

const Contact = ({ about }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastWhatsappUrl, setLastWhatsappUrl] = useState('');

  const WHATSAPP_NUMBER = '919354894461';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      return;
    }

    setIsSending(true);
    setStatus('Preparing your message...');

    // Format WhatsApp message
    const formattedText = `*New Contact Message from Portfolio* 🚀\n\n*Name:* ${formData.name.trim()}\n*Mobile:* ${formData.phone.trim()}\n*Email:* ${formData.email.trim()}\n\n*Message:*\n${formData.message.trim()}\n\n_Sent via Portfolio Website_`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedText)}`;
    setLastWhatsappUrl(whatsappUrl);

    // 1. Record message to database
    try {
      await api.post('/portfolio/contact', formData);
    } catch (error) {
      console.warn('Could not record contact message in DB:', error);
    }

    // 2. Open WhatsApp in a new tab with prefilled message
    window.open(whatsappUrl, '_blank');

    setStatus('Message ready! Opening WhatsApp...');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSending(false);
  };

  if (!about) return null;

  return (
    <section id="contact" className="py-20 px-4 bg-gray-100 dark:bg-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Get In <span className="gradient-text">Touch</span></h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6">Let's Talk</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-justify">
              I'm currently open to new opportunities. Whether you have a question, a project proposal, or just want to say hi, feel free to reach out directly via WhatsApp or email!
            </p>
            
            <div className="space-y-6">
              {/* WhatsApp Contact */}
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-start space-x-4 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm shrink-0 group-hover:scale-105 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-all">
                  <FaWhatsapp size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    WhatsApp
                  </h4>
                  <span className="text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors font-medium text-sm">
                    Chat on WhatsApp
                  </span>
                </div>
              </a>

              {/* Email Contact */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
                  <FiMail size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                  <a 
                    href={`mailto:${about.email || 'techshivam02@gmail.com'}`} 
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors font-medium"
                  >
                    {about.email || 'techshivam02@gmail.com'}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Location</h4>
                  <p className="text-gray-600 dark:text-gray-400">{about.address || 'Greater Noida, India'}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl shadow-xl">
              {status && (
                <div className="mb-6 p-4 rounded-xl text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <FaWhatsapp className="text-lg text-green-500 shrink-0" />
                    <span>{status}</span>
                  </div>
                  {lastWhatsappUrl && (
                    <a
                      href={lastWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-600 dark:text-green-400 underline font-semibold hover:text-green-800 dark:hover:text-green-200 mt-1"
                    >
                      Click here if WhatsApp did not open automatically →
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-6 text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FaWhatsapp className="text-lg" />
                  <span>{isSending ? 'Connecting...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
