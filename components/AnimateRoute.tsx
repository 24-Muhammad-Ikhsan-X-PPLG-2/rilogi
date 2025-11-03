"use client";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FC, PropsWithChildren } from "react";

const AnimateRoute: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        suppressHydrationWarning
        key={pathname}
        // initial={{ x: 100, opacity: 0 }} // mulai dari kanan
        // animate={{ x: 0, opacity: 1 }} // animasi ke tengah
        // transition={{
        //   type: "spring",
        //   stiffness: 200, // kekakuan pegas
        //   damping: 10, // redaman (semakin kecil semakin goyang)
        // }}
        className="absolute w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimateRoute;
