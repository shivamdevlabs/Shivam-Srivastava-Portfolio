import { motion } from 'framer-motion';

const About = ({ about, skills = [] }) => {
  if (!about) return null;

  const defaultSkills = ['Python', 'Django', 'FastAPI', 'Flask', 'React.js', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'MySQL', 'Tailwind CSS'].map(name => ({ name, category: 'technical' }));
  const activeSkills = skills.length > 0 ? skills : defaultSkills;
  
  const technicalSkills = activeSkills.filter(s => (s.category || 'technical') === 'technical');
  const designingSkills = activeSkills.filter(s => s.category === 'designing');
  const otherSkills = activeSkills.filter(s => s.category === 'other');

  const renderSkillGroup = (title, groupSkills) => {
    if (groupSkills.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-gray-200">{title}</h4>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {groupSkills.map((skill) => (
            <span key={skill.name} className="px-4 py-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg text-sm font-medium hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">About <span className="gradient-text">Me</span></h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 sticky top-24"
          >
            <div className="glass p-8 rounded-3xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"></div>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 relative z-10">
                {about.bio}
              </p>
              
              <div className="mt-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                    <a href={`mailto:${about.email}`} className="text-blue-500 hover:underline">{about.email}</a>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">{about.address}</p>
                  </div>
                </div>
                <div className="mt-10 flex justify-center">
                  <a 
                    href={`https://wa.me/${about.phone ? about.phone.replace(/[^0-9]/g, '') : ''}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-10 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition shadow-lg shadow-green-500/30 flex items-center gap-2"
                  >
                    Hire Me
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <h3 className="text-3xl font-bold mb-8 text-center md:text-left">Tech Stack</h3>
            <div className="space-y-8">
              {renderSkillGroup("Technical Skills", technicalSkills)}
              {renderSkillGroup("Designing Skills", designingSkills)}
              {renderSkillGroup("Other Skills", otherSkills)}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
