import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

const Home: NextPage = () => {
  // Scroll to top on component mount and clear hash to prevent jumping
  useEffect(() => {
    // Disable default browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Clear any hash from the URL to prevent browser from jumping to section
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    
    // Fallback: Ensure scroll happens even if there's a slight render delay
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Cehpoint Influence Partners - #1 Influencer Marketing Platform in West Bengal & India | Earn ₹2K-₹10K Per Video</title>
        <meta
          name="description"
          content="Join India's fastest-growing influencer marketing platform. Earn ₹2K-₹10K per video + 5% revenue share. Help West Bengal & Indian entrepreneurs discover EdTech, AgriTech, HealthTech solutions. 2 tasks/month, complete training provided."
        />
        <meta name="keywords" content="influencer marketing india, influencer jobs west bengal, earn money instagram india, youtube influencer earnings, kolkata influencer platform, bengali influencer opportunities, social media income india, digital marketing west bengal, entrepreneur support india, influencer collaboration platform" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cehpoint Influence Partners - Earn ₹2K-₹10K Per Video as Influencer" />
        <meta property="og:description" content="India's #1 platform for influencers to earn while promoting EdTech, AgriTech, HealthTech. Join 1000+ influencers building Digital India." />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:url" content="https://cehpoint-influence.repl.co" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cehpoint - Earn as Influencer Marketing Partner" />
        <meta name="twitter:description" content="₹2K-₹10K per video + 5% revenue share. Help Indian entrepreneurs grow with technology." />
        
        <meta name="geo.region" content="IN-WB" />
        <meta name="geo.placename" content="Kolkata, West Bengal, India" />
        <meta name="geo.position" content="22.5726;88.3639" />
        <meta name="ICBM" content="22.5726, 88.3639" />
        
        <link rel="canonical" href="https://cehpoint-influence.repl.co" />
        <link rel="icon" href="/favicon.ico" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Cehpoint Influence Partners",
            "description": "India's leading influencer marketing platform connecting influencers with entrepreneurs",
            "url": "https://cehpoint-influence.repl.co",
            "logo": "https://cehpoint-influence.repl.co/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Kolkata",
              "addressRegion": "West Bengal",
              "addressCountry": "IN"
            },
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "22.5726",
                "longitude": "88.3639"
              },
              "geoRadius": "2000000"
            }
          })}
        </script>
      </Head>

      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center min-h-[4rem] sm:min-h-[5rem] py-2 sm:py-0 gap-y-2">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link href="/">
                <span className="text-lg sm:text-2xl font-black text-gray-900 cursor-pointer tracking-tight flex items-center gap-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Cehpoint</span> 
                  <span>Influence</span>
                </span>
              </Link>
              <span className="hidden md:inline-flex px-3 py-1 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100 shadow-sm">
                West Bengal's #1
              </span>
            </div>

            {/* Right: Navigation & Actions - Unified for consistent spacing */}
            <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 flex-shrink-0 ml-auto">
              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-8">
                <a 
                  href="#how-it-works" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors relative group"
                >
                  How It Works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                </a>
                <a 
                  href="#pricing" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors relative group"
                >
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                </a>
                 <a 
                   href="#why-join" 
                   onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('why-join')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                   className="text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors relative group"
                 >
                  Why Us?
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
                {/* Login Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-1 sm:gap-2 text-gray-700 font-semibold hover:text-orange-600 transition-colors py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg hover:bg-orange-50/50 text-sm sm:text-base">
                    Login 
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black ring-opacity-5">
                      <div className="p-2 space-y-1">
                        <Link 
                          href="/login/influencer"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors group/item"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover/item:bg-orange-200 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                              <span className="font-bold block text-sm">Influencer Login</span>
                              <span className="text-xs text-gray-500">For Creators</span>
                            </div>
                        </Link>
                        <Link 
                          href="/login/brand"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors group/item"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover/item:bg-indigo-200 transition-colors">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                               <span className="font-bold block text-sm">Brand Login</span>
                               <span className="text-xs text-gray-500">For Companies</span>
                            </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Get Started CTA */}
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:-translate-y-0.5">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 py-20 sm:py-28">
          <div className="absolute inset-0 opacity-5">
            <img src="/west-bengal-bg.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 font-semibold mb-6 rounded-full text-sm">
                  Trusted by 1000+ Influencers Across India
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                  Turn Your Influence Into
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-600">
                    Serious Income
                  </span>
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  India's first platform where influencers earn <span className="font-bold text-orange-600">₹2,000 to ₹10,000 per video</span> (based on your first video quality) + <span className="font-bold text-orange-600">5% revenue share</span> by helping entrepreneurs discover EdTech, AgriTech & HealthTech solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all">
                      Start Earning Today →
                    </Button>
                  </Link>
                </div>
                


                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mt-10">

                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <div className="text-3xl font-black text-orange-600 mb-1">₹2K-₹10K</div>
                    <div className="text-sm text-gray-600 font-semibold">Per Video (Quality Based)</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <div className="text-3xl font-black text-red-600 mb-1">+5%</div>
                    <div className="text-sm text-gray-600 font-semibold">Revenue Share</div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block relative">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-3xl"></div>
                  <img 
                    src="/hero-influencer.jpg" 
                    alt="Successful Indian Influencer Creating Content" 
                    className="relative rounded-2xl shadow-2xl object-cover h-[550px] w-full border-4 border-white"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 w-2.5 h-2.5 rounded-full animate-pulse"></div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">1000+ Active Influencers</div>
                        <div className="text-gray-600 text-xs">Earning across India</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Section - Emphasizing Marketing Partnership */}
        <section id="why-join" className="py-20 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Become a <span className="text-orange-500">Trusted Marketing Partner</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                As a Cehpoint influencer, you're not just earning income—you're our official marketing channel helping entrepreneurs discover life-changing technology solutions. Your voice builds businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">You Market Our Solutions</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As our official marketing partner, you promote verified EdTech, AgriTech, and HealthTech solutions to your audience. We provide the products, you provide the reach.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Earn ₹2K-₹10K per marketing video</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Plus 5% revenue share on every lead you generate</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Your audience becomes our customers</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Promote Genuine Businesses</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Every task you receive promotes real, verified businesses helping Indian entrepreneurs succeed. You're not selling products—you're connecting people with opportunities.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Only 2 marketing campaigns per month</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Complete scripts and guidelines provided</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Pre-approved, trusted business solutions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-200 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Your Content = Our Growth</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Each video you create drives customers to our partnered businesses. You're our sales and marketing team—reaching audiences we can't reach alone.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Pre-approval ensures brand alignment</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Quality control protects your reputation</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Track impact: leads, conversions, revenue</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Partnership, Not Commission</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This isn't affiliate marketing—it's a true business partnership. You help us grow, we help you earn. Transparent payouts, instant payments, full performance tracking.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>See exactly how many leads you generated</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Track revenue share in real-time</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Instant UPI payouts, no delays</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Value Proposition Banner */}
            <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-10 text-center">
              <h3 className="text-3xl font-black text-white mb-4">
                You're Our Marketing Department
              </h3>
              <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                Every video you create is a marketing campaign for our partner businesses. Your followers become our customers. Your content drives our revenue. That's why we pay you ₹2K-₹10K per video + 5% of every sale you generate. This is genuine business partnership.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Start Earning in 4 Simple Steps
              </h2>
              <p className="text-xl text-gray-600">
                From registration to payment in 7 days or less
              </p>
            </div>
            <div className="grid lg:grid-cols-4 gap-6">
              {[
                {
                  num: "1",
                  title: "Register Free",
                  desc: "Sign up with social media links, upload ID proof. Get approved within 24-48 hours.",
                },
                {
                  num: "2",
                  title: "Get Your Tasks",
                  desc: "Receive 2 curated tasks monthly with complete guidelines and scripts.",
                },
                {
                  num: "3",
                  title: "Create & Submit",
                  desc: "Make your video using our playbook. Submit for pre-approval.",
                },
                {
                  num: "4",
                  title: "Get Paid",
                  desc: "We analyze your first video and assign your custom rate (₹2K-₹10K). Higher quality = higher earnings + 5% revenue share.",
                }
              ].map((step, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 relative">
                  <div className="absolute -top-4 -left-4 bg-gradient-to-br from-orange-500 to-red-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg">
                    {step.num}
                  </div>
                  <h4 className="text-xl font-bold mb-3 mt-4 text-gray-900">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Quality-Based Payment Explanation */}
            <div id="pricing" className="max-w-4xl mx-auto mt-16 scroll-mt-24">
              <div className="bg-white rounded-2xl border-2 border-orange-300 p-5 sm:p-10 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 leading-tight">
                      💡 How Your Payment Rate is Decided
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                      <strong className="text-orange-600">We don't pay fixed amounts.</strong> Your earnings are based on the quality of your work:
                    </p>
                    <ol className="space-y-4 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 sm:mt-0">1</span>
                        <span className="text-sm sm:text-base flex-1"><strong>Submit your first video</strong> - Following our guidelines and sample scripts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 sm:mt-0">2</span>
                        <span className="text-sm sm:text-base flex-1"><strong>We analyze quality</strong> - Video production, editing, presentation, authenticity</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 sm:mt-0">3</span>
                        <span className="text-sm sm:text-base flex-1"><strong>We review your profile</strong> - Engagement rate, audience demographics, reach</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-orange-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 sm:mt-0">4</span>
                        <span className="text-sm sm:text-base flex-1"><strong>You get YOUR custom rate</strong> - Typically ₹2,000 to ₹10,000 per video based on your quality</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-green-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5 sm:mt-0">5</span>
                        <span className="text-sm sm:text-base flex-1"><strong>All future videos</strong> - Earn at your assigned rate + 5% revenue share on leads you generate</span>
                      </li>
                    </ol>
                    <div className="bg-orange-50 p-4 sm:p-6 rounded-xl mt-6 border-l-4 border-orange-500">
                      <p className="text-sm sm:text-base text-gray-800 font-semibold">
                        <strong>Higher quality content = Higher earnings.</strong> This ensures fair payment and rewards influencers who create professional, effective marketing videos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                Join West Bengal's Growing <span className="text-orange-500">Creator Economy</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Influencers from Kolkata, Howrah, Durgapur, Siliguri, and across Bengal are already earning
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-200 text-center">
                <div className="text-5xl font-black text-blue-600 mb-2">1000+</div>
                <div className="text-gray-900 font-bold text-lg mb-1">Active Influencers</div>
                <div className="text-gray-600">Across India & West Bengal</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-200 text-center">
                <div className="text-5xl font-black text-orange-600 mb-2">₹50L+</div>
                <div className="text-gray-900 font-bold text-lg mb-1">Paid to Influencers</div>
                <div className="text-gray-600">In the last 6 months</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-200 text-center">
                <div className="text-5xl font-black text-green-600 mb-2">5000+</div>
                <div className="text-gray-900 font-bold text-lg mb-1">Entrepreneurs Helped</div>
                <div className="text-gray-600">Businesses created & scaled</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - FIXED VISIBILITY */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-12 sm:p-16 text-center shadow-2xl">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-white mb-10 max-w-2xl mx-auto">
                Join 1000+ influencers building Digital India and earning serious income. No fees, no hidden charges.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register/influencer">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-100 font-black text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all"
                  >
                    Join Free - Start Earning →
                  </Button>
                </Link>
                <Link href="/login/influencer">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 font-black text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-900"
                  >
                    Login to Dashboard
                  </Button>
                </Link>
              </div>
              <p className="text-white mt-8 font-semibold text-sm">
                ✓ Free Registration  ✓ No Hidden Fees  ✓ 24-48 Hour Approval
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <h3 className="text-white font-black text-xl mb-3">
                <span className="text-orange-500">Cehpoint</span> Influence
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                India's #1 influencer marketing platform. Empowering creators across West Bengal & India to earn while building Digital India.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">For Influencers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register/influencer" className="hover:text-orange-400 transition-colors">Register Free</Link></li>
                <li><Link href="/login/influencer" className="hover:text-orange-400 transition-colors">Influencer Login</Link></li>
                <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Locations</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Kolkata, West Bengal</li>
                <li>Howrah, Durgapur</li>
                <li>Siliguri, Asansol</li>
                <li>All India Coverage</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">&copy; 2025 Cehpoint Influence Partners. All rights reserved.</p>
            <p className="text-gray-500 text-xs mt-1">Empowering West Bengal & India's Digital Economy</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
