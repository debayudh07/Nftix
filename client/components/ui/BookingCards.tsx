"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Ticket, Mic } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    title: "Concerts",
    icon: <Music className="h-12 w-12 md:h-24 md:w-24" />,
    color: "from-orange-400 to-orange-600",
  },
  {
    title: "Sports",
    icon: <Ticket className="h-12 w-12 md:h-24 md:w-24" />,
    color: "from-orange-500 to-orange-700",
  },
  {
    title: "Stand-Up",
    icon: <Mic className="h-12 w-12 md:h-24 md:w-24" />,
    color: "from-orange-600 to-orange-800",
  },
];

export default function BookingCards() {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleClick = (index: number) => {
    console.log(`Navigating to booking page for ${categories[index].title}`);
    // In a real application, you would use Next.js routing here
    // router.push(`/booking/${categories[index].title.toLowerCase()}`)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {categories.map((category, index, key) => (
        <Link href="/bookticket">
          <motion.div
            key={category.title}
            className="relative h-80 rounded-xl shadow-lg cursor-pointer overflow-hidden"
            initial={{ rotateY: 180 }}
            animate={{ rotateY: flipped === index ? 0 : 180 }}
            transition={{ duration: 0.6 }}
            onHoverStart={() => {
              setFlipped(index);
              setHovered(index);
            }}
            onHoverEnd={() => {
              setFlipped(null);
              setHovered(null);
            }}
            onClick={() => handleClick(index)}
          >
            <motion.div
              className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br ${category.color} p-6 flex flex-col items-center justify-center backface-hidden`}
            >
              {category.icon}
              <h2 className="text-2xl font-bold mt-4 text-white">
                {category.title}
              </h2>
              <p className="mt-2 text-center text-white">
                Click to book tickets
              </p>
            </motion.div>
            <motion.div
              className={`absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br ${category.color} p-6 flex items-center justify-center backface-hidden`}
              style={{ rotateY: 180 }}
            >
              <div className="text-white">{category.icon}</div>
            </motion.div>
            <AnimatePresence>
              {hovered === index && (
                <motion.div
                  className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-4xl font-bold text-white">
                    {category.title}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
