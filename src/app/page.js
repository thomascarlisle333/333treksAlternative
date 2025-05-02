'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const navigateToGallery = () => {
    router.push('/gallery');
  };

  const navigateToMap = () => {
    router.push('/map');
  };

  const navigateToTrip = () => {
    router.push('/trip');
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="relative h-screen">
          {/* Background Image with overlay */}
          <div className="absolute inset-0 z-10">
            <div className="relative w-full h-full">
              <Image
                  src="/Final/Vatican_City/Vatican_City/Vatican_City_Vatican_City_Vatican_City_1_011122.jpg"
                  alt="Travel photography hero"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent"></div>
          </div>


          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Capturing the World, One Frame at a Time
            </h1>
            <div className="w-24 h-1 bg-white mb-8"></div>
            <p className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Welcome to my personal journey around the globe. Through my lens,
              I've documented breathtaking landscapes, vibrant cultures, and intimate
              moments that tell the story of our beautiful planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                  onClick={navigateToGallery}
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Explore Gallery
              </button>
              <button
                  onClick={navigateToMap}
                  className="px-8 py-4 bg-gray-800 text-white rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                View Photo Map
              </button>
              <button
                  onClick={navigateToTrip}
                  className="px-8 py-4 bg-gray-600 text-white rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Explore My Trips
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">My Photographic Journey</h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto mb-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg leading-relaxed mb-6">
                  Photography allows me to freeze moments in time, preserving the beauty
                  and emotion of places I've been fortunate enough to visit. From bustling
                  city streets to remote wilderness, each location has its own story to tell.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  My camera has taken me across continents, through diverse cultures, and into
                  the lives of extraordinary people. This gallery is a collection of those experiences,
                  organized by the countries and cities that have left their mark on me.
                </p>
                <p className="text-lg leading-relaxed">
                  I hope these images inspire you to see the world through a different lens and
                  perhaps embark on your own journey of discovery.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                  <Image
                      src="/Final/Spain/Barcelona/Barcelona_Barcelona_Spain_2_093022.jpg" // Replace with path to your image
                      alt="Photography journey"
                      fill
                      style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg mt-8">
                  <Image
                      src="/Final/Portugal/Lisbon/Lisbon_Lisbon_Portugal_5_020323.jpg" // Replace with path to your image
                      alt="Photography journey"
                      fill
                      style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                  <Image
                      src="/Final/Norway/Bergen/Bergen_Vestland_Norway_5_041023.jpg" // Replace with path to your image
                      alt="Photography journey"
                      fill
                      style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg mt-8">
                  <Image
                      src="/Final/Hungary/Budapest/Budapest_Budapest_Hungary_8_021323.jpg" // Replace with path to your image
                      alt="Photography journey"
                      fill
                      style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Explore?</h2>
            <p className="text-lg mb-8">
              Browse my collection of images from around the world, organized by country and city,
              or explore the interactive map to see where each photo was taken.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                  onClick={navigateToGallery}
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                View Gallery
              </button>
              <button
                  onClick={navigateToMap}
                  className="px-8 py-4 bg-gray-800 text-white border border-white rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Explore Map
              </button>
              <button
                  onClick={navigateToTrip}
                  className="px-8 py-4 bg-gray-600 text-white rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Explore My Trips
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-gray-800 text-white">
          <div className="max-w-6xl mx-auto text-center">
            <p>© {new Date().getFullYear()} 333Treks. All rights reserved.</p>
          </div>
        </footer>

        {/* CSS for animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
        `}</style>
      </div>
  );
}