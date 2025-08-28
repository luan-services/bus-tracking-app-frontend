import React from 'react';
import type { LucideProps } from 'lucide-react';

interface FeatureCardProps {
  Icon: React.ElementType<LucideProps>;  // ElementType allow any kind of element, <LucideProps> is a special props imported from lucide

  title: string;
  description: string;
}

export const FeatureCard = ({ Icon, title, description }: FeatureCardProps) => {

  return (
    <div className="bg-white border-[1.5] border-gray-200 rounded-2xl shadow-lg p-4 md:p-8 min-h-76 md:min-h-96 m-4 max-w-76 md:max-w-sm justify-center w-full flex flex-col items-center text-center hover:shadow-xl hover:border-gray-300 transition duration-300">
      <div className="bg-custom-light-green p-4 rounded-xl">
        <Icon className="text-green-900 h-8 w-8" />
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-gray-700 py-4">
        {title}
      </h3>

      <p className="md:text-[16px] text-gray-600">
        {description}
      </p>
    </div>
  );
};