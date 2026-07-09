/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  id?: string;
  title: string;
  subtitle: string;
  badge?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ id, title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <motion.div
      id={id || "page-header-container"}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100 mb-6"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-sans">
          {subtitle}
        </p>
      </div>
      {action && (
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {action}
        </div>
      )}
    </motion.div>
  );
}
