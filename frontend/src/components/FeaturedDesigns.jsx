import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FeaturedDesigns = ({ designs }) => {
  const [activeTab, setActiveTab] = useState("image"); // 'image' or 'video'
  const [selectedIndex, setSelectedIndex] = useState(null);

  const displayDesigns = designs || [];

  // Filter and reverse: oldest first, and match the active tab
  const filteredDesigns = [...displayDesigns]
    .reverse()
    .filter((design) => design.media_type === activeTab);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    if (selectedIndex !== null) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredDesigns]);

  const handleNext = () => {
    if (selectedIndex !== null && filteredDesigns.length > 0) {
      setSelectedIndex((selectedIndex + 1) % filteredDesigns.length);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && filteredDesigns.length > 0) {
      setSelectedIndex((selectedIndex - 1 + filteredDesigns.length) % filteredDesigns.length);
    }
  };

  return (
    <section id="designs" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured My Designs
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-8"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            A showcase of my creative graphic designs and video reels.
          </p>

          {/* Sliding Toggle Buttons */}
          <div className="flex justify-center mb-12">
            <div className="relative flex bg-gray-100 dark:bg-slate-700 rounded-full p-1 shadow-inner">
              <button
                onClick={() => setActiveTab("image")}
                className={`relative z-10 flex-1 px-8 py-2 text-sm md:text-base font-medium rounded-full transition-colors duration-300 ${
                  activeTab === "image"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`relative z-10 flex-1 px-8 py-2 text-sm md:text-base font-medium rounded-full transition-colors duration-300 ${
                  activeTab === "video"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Reels
              </button>

              {/* Animated Background Slider */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full shadow transition-all duration-300 ease-out z-0 ${
                  activeTab === "image" ? "left-1" : "left-[calc(50%+3px)]"
                }`}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <AnimatePresence mode="popLayout">
            {filteredDesigns.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center col-span-full text-gray-500 italic w-full py-10"
              >
                No {activeTab === "image" ? "images" : "videos"} have been
                featured yet.
              </motion.p>
            ) : (
              filteredDesigns.map((design, index) => (
                <motion.div
                  key={design.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedIndex(index)}
                  className="bg-gray-50 dark:bg-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
                >
                  <div className="relative w-full bg-gray-200 dark:bg-gray-800">
                    {design.media_type === "video" ? (
                      <video
                        src={`http://localhost:8000${design.media_url}`}
                        className="w-full h-auto"
                        controls
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        loop
                        muted
                      />
                    ) : (
                      <img
                        src={`http://localhost:8000${design.media_url}`}
                        alt={design.title}
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                      {design.title}
                    </h3>
                    {design.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                        {design.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedIndex !== null && filteredDesigns[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white p-2 transition"
            >
              <FiX size={32} />
            </button>

            {/* Previous Button */}
            {filteredDesigns.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition bg-black/20 hover:bg-black/50 rounded-full"
              >
                <FiChevronLeft size={48} />
              </button>
            )}

            {/* Media Container */}
            <div
              className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredDesigns[selectedIndex].media_type === "video" ? (
                <video
                  src={`http://localhost:8000${filteredDesigns[selectedIndex].media_url}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  autoPlay
                />
              ) : (
                <img
                  src={`http://localhost:8000${filteredDesigns[selectedIndex].media_url}`}
                  alt={filteredDesigns[selectedIndex].title}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
              
              <div className="mt-4 text-center">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {filteredDesigns[selectedIndex].title}
                </h3>
                {filteredDesigns[selectedIndex].description && (
                  <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
                    {filteredDesigns[selectedIndex].description}
                  </p>
                )}
              </div>
            </div>

            {/* Next Button */}
            {filteredDesigns.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition bg-black/20 hover:bg-black/50 rounded-full"
              >
                <FiChevronRight size={48} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedDesigns;
