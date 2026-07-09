/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div id="content-wrapper" className="flex-1 flex flex-col min-w-0 bg-slate-50/50 min-h-screen">
      {children}
    </div>
  );
}
