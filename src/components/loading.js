import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  const spinnerVariants = {
    rotate: {
      rotate: [0, 360],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      },
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        className="stroke-[#0F111B] dark:stroke-[#DEE4FF]"
        strokeWidth="8"
        fill="transparent"
        variants={spinnerVariants}
        animate="rotate"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="20"
        className="fill-[#0F111B] dark:stroke-[#DEE4FF]"
        variants={spinnerVariants}
        animate="pulse"
      />
    </motion.svg>
  );
};

export default LoadingSpinner;
