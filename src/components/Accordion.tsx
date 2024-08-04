import React, { useState, useRef, useEffect } from 'react';

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  fontSize?: string;
  isOpen?: boolean;
};

const Accordion: React.FC<AccordionProps> = ({ title, children, fontSize = '16px', isOpen = false }) => {
  const [isOpenState, setIsOpenState] = useState(isOpen);
  const [height, setHeight] = useState('0px');
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleAccordion = () => {
    setIsOpenState(!isOpenState);
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpenState ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isOpenState]);

  useEffect(() => {
    setIsOpenState(isOpen);
  }, [isOpen]);

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={toggleAccordion}>
        <h3 style={{ fontSize }}>{title}</h3>
        <span>
          {isOpenState ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15L5 8H19L12 15Z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9L5 16H19L12 9Z" fill="currentColor"/>
            </svg>
          )}
        </span>
      </div>
      <div
        ref={contentRef}
        className="accordion-content"
        style={{ height, overflow: 'hidden', transition: 'height 0.3s ease' }}
      >
        {children}
      </div>
    </div>
  );
};

export default Accordion;