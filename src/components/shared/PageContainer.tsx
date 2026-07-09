/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface PageContainerProps {
  id?: string;
  children: React.ReactNode;
}

export default function PageContainer({ id, children }: PageContainerProps) {
  return (
    <motion.div
      id={id || "page-container"}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2"
    >
      {children}
    </motion.div>
  );
}
