import React from 'react';
import Breadcrumb from './Breadcrumb';

export default function PageHeader({ title, subtitle, breadcrumbs, right }) {
  return (
    <header className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0f172a]">{title}</h1>
            {subtitle && <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      </div>
    </header>
  );
}
