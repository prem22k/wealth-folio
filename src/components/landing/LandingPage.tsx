'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <CTASection />
            <Footer />
        </div>
    );
}
