import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CaseStudy({ onClose, caseId }) {
  const navigate = useNavigate();
  const steps = [
    'Observe – open the evidence panel',
    'Hypothesize – pick a hypothesis',
    'Repair – write a fix and run tests',
    'Verify – submit and earn XP',
  ];

  const goToCase = () => {
    onClose();
    navigate(`/case/${caseId}`);
  };

  return (
    <motion.div
      className="case-study-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="modal-backdrop" onClick={onClose} />
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2 className="modal-title">
          <CheckCircle2 size={24} className="mr-2" />Demo: Complete a case
        </h2>
        <p className="modal-intro">
          Follow the four detective steps to finish <strong>{caseId}</strong>. The UI will
          highlight the needed panels as you progress.
        </p>
        <ol className="step-list">
          {steps.map((s, i) => (
            <li key={i} className="step-item">
              <span className="step-number">{i + 1}</span> {s}
            </li>
          ))}
        </ol>
        <button className="btn btn-primary mt-4" onClick={goToCase}>
          Go to case <ArrowRight size={16} className="ml-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}
