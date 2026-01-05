import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <>
      {/* Subtle gradient mesh background for light theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orb - subtle navy */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/4 -left-1/4 w-[60%] h-[60%] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(30, 58, 95, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Secondary gradient orb - subtle accent */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(232, 93, 4, 0.1) 0%, transparent 70%)",
          }}
        />
      </div>
    </>
  );
}
