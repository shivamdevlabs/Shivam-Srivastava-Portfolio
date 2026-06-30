import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import FeaturedDesigns from '../components/FeaturedDesigns';
import ExperienceTimeline from '../components/ExperienceTimeline';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const Portfolio = () => {
  const [data, setData] = useState({
    about: null,
    projects: [],
    designs: [],
    experience: [],
    education: [],
    certificates: [],
    skills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, projRes, designsRes, expRes, eduRes, certRes, skillsRes] = await Promise.all([
          api.get('/portfolio/about'),
          api.get('/portfolio/projects'),
          api.get('/portfolio/graphic-designs'),
          api.get('/portfolio/experience'),
          api.get('/portfolio/education'), // We can add this route or combine with experience
          api.get('/portfolio/certificates'),
          api.get('/portfolio/skills')
        ]);
        
        setData({
          about: aboutRes.data,
          projects: projRes.data,
          designs: designsRes.data,
          experience: expRes.data,
          education: eduRes.data || [],
          certificates: certRes.data,
          skills: skillsRes.data || []
        });
      } catch (err) {
        console.error("Failed to load portfolio data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { about, projects, designs, experience, education, certificates, skills } = data;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300 text-gray-800 dark:text-gray-100 font-sans">
      <Helmet>
        <title>{about?.name ? `${about.name} - Software Developer` : 'Portfolio'}</title>
        <meta name="description" content={about?.bio || 'Software Developer Portfolio'} />
      </Helmet>

      <Navbar about={about} />
      
      <main>
        <Hero about={about} />
        <About about={about} skills={skills} />
        <ExperienceTimeline experience={experience} education={education} />
        <Projects projects={projects} />
        <FeaturedDesigns designs={designs} />
        <Certificates certificates={certificates} />
        <Contact about={about} />
      </main>

      <Footer about={about} />
    </div>
  );
};

export default Portfolio;
