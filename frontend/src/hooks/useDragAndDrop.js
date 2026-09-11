import { useState, useRef } from 'react';

/**
 * Custom hook for smooth HTML5 drag-and-drop list reordering with mouse.
 * 
 * @param {Array} items - Array of list items
 * @param {Function} setItems - State setter for items
 * @param {Function} onReorder - Callback executed on drop with reordered items: (newItems) => Promise<void>
 */
export const useDragAndDrop = (items, setItems, onReorder) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const draggedIndexRef = useRef(null);
  const dragOverIndexRef = useRef(null);

  const handleDragStart = (e, index) => {
    draggedIndexRef.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or standard ghost image
    try {
      e.dataTransfer.setData('text/plain', `${index}`);
    } catch {
      // safe fallback
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndexRef.current !== index) {
      dragOverIndexRef.current = index;
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = draggedIndexRef.current;
    const toIndex = dropIndex !== undefined ? dropIndex : dragOverIndexRef.current;

    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
      const updated = [...items];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);

      setItems(updated);

      if (onReorder) {
        try {
          await onReorder(updated);
        } catch (err) {
          console.error('Failed to save new order:', err);
        }
      }
    }
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
    dragOverIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getItemProps = (index) => {
    const isDragging = draggedIndex === index;
    const isOver = dragOverIndex === index && draggedIndex !== index;

    return {
      draggable: true,
      onDragStart: (e) => handleDragStart(e, index),
      onDragOver: (e) => handleDragOver(e, index),
      onDragLeave: handleDragLeave,
      onDrop: (e) => handleDrop(e, index),
      onDragEnd: handleDragEnd,
      className: `transition-all duration-200 ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-dashed border-2 border-blue-500'
          : isOver
          ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 border-blue-400'
          : ''
      }`,
      isDragging,
      isOver,
    };
  };

  return {
    draggedIndex,
    dragOverIndex,
    getItemProps,
  };
};

export default useDragAndDrop;
