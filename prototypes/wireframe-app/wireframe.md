import React, { useState } from 'react';
import { ChevronRight, Star, MapPin, Calendar, Clock, DollarSign, User, Home, Search, MessageSquare, CheckCircle, AlertCircle, Camera, Shield, CreditCard, Menu, X } from 'lucide-react';

const WireframeApp = () => {
  const [activeFlow, setActiveFlow] = useState('customer-search');
  const [currentScreen, setCurrentScreen] = useState(0);

  // Define user flows
  const flows = {
    'customer-search': {
      name: 'Customer: Search & Book',
      color: 'bg-[#FF4444A22]',
      screens: [
        {
          title: 'Home / Search',
          description: 'Customer lands and searches for service',
          component: CustomerHomeScreen
        },
        {
          title: 'Search Results',
          description: 'Browse professionals matching criteria',
          component: SearchResultsScreen
        },
        {
          title: 'Professional Profile',
          description: 'View detailed professional information',
          component: ProfessionalProfileScreen
        },
        {
          title: 'Create Booking',
          description: 'Select date, time, and confirm booking',
          component: CreateBookingScreen
        },
        {
          title: 'Booking Confirmation',
          description: 'Review and confirm booking details',
          component: BookingConfirmationScreen
        }
      ]
    },
    'professional-booking': {
      name: 'Professional: Manage Booking',
      color: 'bg-[#FF4444A22]',
      screens: [
        {
          title: 'Booking Request',
          description: 'Receive and review new booking request',
          component: BookingRequestScreen
        },
        {
          title: 'Customer Profile',
          description: 'View customer profile before accepting',
          component: CustomerProfileScreen
        },
        {
          title: 'Accept Booking',
          description: 'Accept and add to calendar',
          component: AcceptBookingScreen
        },
        {
          title: 'Check-In',
          description: 'Start service with GPS check-in',
          component: CheckInScreen
        },
        {
          title: 'Complete & Rate',
          description: 'Check-out and rate customer',
          component: CompleteServiceScreen
        }
      ]
    },
    'professional-onboarding': {
      name: 'Professional: Onboarding',
      color: 'bg-[#FF4444A22]',
      screens: [
        {
          title: 'Apply',
          description: 'Submit application form',
          component: ApplyScreen
        },
        {
          title: 'Upload Documents',
          description: 'Upload ID and verification docs',
          component: UploadDocsScreen
        },
        {
          title: 'Interview Schedule',
          description: 'Schedule in-person interview',
          component: InterviewScheduleScreen
        },
        {
          title: 'Create Profile',
          description: 'Build professional profile',
          component: CreateProfileScreen
        },
        {
          title: 'Profile Live',
          description: 'Profile approved and live',
          component: ProfileLiveScreen
        }
      ]
    },
    'customer-rating': {
      name: 'Customer: Rate Service',
      color: 'bg-[#FF4444A22]',
      screens: [
        {
          title: 'Service Complete',
          description: 'Notification that service is done',
          component: ServiceCompleteScreen
        },
        {
          title: 'Rate Professional',
          description: 'Provide ratings and review',
          component: RateProfessionalScreen
        },
        {
          title: 'Add Tip',
          description: 'Optional tip for great service',
          component: AddTipScreen
        },
        {
          title: 'Payment Confirmed',
          description: 'Final payment processed',
          component: PaymentConfirmedScreen
        }
      ]
    }
  };

  const currentFlow = flows[activeFlow];
  const Screen = currentFlow.screens[currentScreen].component;

  const nextScreen = () => {
    if (currentScreen < currentFlow.screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const changeFlow = (flowKey) => {
    setActiveFlow(flowKey);
    setCurrentScreen(0);
  };

  return (
    <div className="min-h-screen bg-[#FFEEFF8E8] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#FFEEFF8E8] rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#116611616] mb-2">🏠 Trusted Home Services</h1>
          <p className="text-[#AA88AAAAC]">Interactive Wireframes & User Flows</p>
        </div>

        {/* Flow Selector */}
        <div className="bg-[#FFEEFF8E8] rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Select User Flow:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(flows).map(([key, flow]) => (
              <button
                key={key}
                onClick={() => changeFlow(key)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activeFlow === key
                    ? `${flow.color} text-[#FFEEFF8E8] border-transparent`
                    : 'bg-[#FFEEFF8E8] text-[#116611616] border-[#EE44EE2E3] hover:border-[#EE44EE2E3]'
                }`}
              >
                <div className="font-bold">{flow.name}</div>
                <div className="text-sm opacity-90">{flow.screens.length} screens</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Flow Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#FFEEFF8E8] rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Flow Progress</h3>
              <div className="space-y-3">
                {currentFlow.screens.map((screen, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentScreen(idx)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      idx === currentScreen
                        ? 'bg-[#FF4444A22] border-2 border-[#FF4444A22]'
                        : idx < currentScreen
                        ? 'bg-[#FF4444A22] border-2 border-[#FF4444A22]'
                        : 'bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8]'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                        idx === currentScreen
                          ? 'bg-[#FF4444A22] text-[#FFEEFF8E8]'
                          : idx < currentScreen
                          ? 'bg-[#FF4444A22] text-[#FFEEFF8E8]'
                          : 'bg-[#EE44EE2E3] text-[#AA88AAAAC]'
                      }`}>
                        {idx < currentScreen ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{screen.title}</div>
                        <div className="text-xs text-[#AA88AAAAC]">{screen.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wireframe Display */}
          <div className="lg:col-span-3">
            <div className="bg-[#FFEEFF8E8] rounded-lg shadow-lg overflow-hidden">
              {/* Screen Header */}
              <div className={`${currentFlow.color} text-[#FFEEFF8E8] p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">{currentFlow.screens[currentScreen].title}</h2>
                  <div className="text-sm bg-[#FFEEFF8E8] bg-opacity-20 px-3 py-1 rounded-full">
                    {currentScreen + 1} / {currentFlow.screens.length}
                  </div>
                </div>
                <p className="text-sm opacity-90">{currentFlow.screens[currentScreen].description}</p>
              </div>

              {/* Phone Frame */}
              <div className="p-8 bg-[#FFEEFF8E8] flex justify-center">
                <div className="w-full max-w-md">
                  {/* Phone mockup */}
                  <div className="bg-[#FFEEFF8E8] rounded-3xl shadow-2xl border-8 border-[#116611616] overflow-hidden">
                    {/* Phone notch */}
                    <div className="bg-[#116611616] h-6 flex justify-center items-center">
                      <div className="bg-[#116611616] w-32 h-4 rounded-b-2xl"></div>
                    </div>
                    
                    {/* Screen content */}
                    <div className="bg-[#FFEEFF8E8]" style={{ minHeight: '600px' }}>
                      <Screen />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 bg-[#FFEEFF8E8] border-t flex justify-between">
                <button
                  onClick={prevScreen}
                  disabled={currentScreen === 0}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    currentScreen === 0
                      ? 'bg-[#FFEEFF8E8] text-[#EE44EE2E3] cursor-not-allowed'
                      : 'bg-[#116611616] text-[#FFEEFF8E8] hover:bg-[#116611616]'
                  }`}
                >
                  ← Previous
                </button>
                <button
                  onClick={nextScreen}
                  disabled={currentScreen === currentFlow.screens.length - 1}
                  className={`px-6 py-2 rounded-lg font-semibold ${
                    currentScreen === currentFlow.screens.length - 1
                      ? 'bg-[#FFEEFF8E8] text-[#EE44EE2E3] cursor-not-allowed'
                      : 'bg-[#FF4444A22] text-[#FFEEFF8E8] hover:bg-[#FF4444A22]'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Screen Components

function CustomerHomeScreen() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Services</h1>
          <p className="text-sm text-[#AA88AAAAC]">Trusted professionals near you</p>
        </div>
        <div className="w-10 h-10 bg-[#FF4444A22] rounded-full flex items-center justify-center text-[#FFEEFF8E8]">
          <User size={20} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="What service do you need?"
            className="w-full p-4 pr-12 border-2 border-[#EE44EE2E3] rounded-lg focus:border-[#FF4444A22]"
          />
          <Search className="absolute right-4 top-4 text-[#EE44EE2E3]" size={20} />
        </div>
      </div>

      {/* Service Categories */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Popular Services</h3>
        <div className="grid grid-cols-3 gap-3">
          {['Cleaning', 'Cooking', 'Laundry', 'Ironing', 'Organization', 'Deep Clean'].map(service => (
            <button key={service} className="p-3 bg-[#FF4444A22] rounded-lg text-center hover:bg-[#FF4444A22]">
              <div className="text-2xl mb-1">🧹</div>
              <div className="text-xs font-medium">{service}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Top Professionals */}
      <div>
        <h3 className="font-semibold mb-3">Top Professionals</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="border-2 border-[#FFEEFF8E8] rounded-lg p-3 hover:border-[#FF4444A22] cursor-pointer">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-semibold">Maria Rodriguez</div>
                  <div className="flex items-center text-sm text-[#AA88AAAAC]">
                    <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
                    <span className="font-semibold mr-2">4.9</span>
                    <span>(127 reviews)</span>
                  </div>
                  <div className="text-sm text-[#AA88AAAAC]">Cleaning • Cooking</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FF4444A22]">$25/hr</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchResultsScreen() {
  return (
    <div className="p-4">
      {/* Header with back */}
      <div className="flex items-center mb-4">
        <button className="mr-3 text-[#AA88AAAAC]">←</button>
        <div className="flex-1">
          <h2 className="font-bold">Cleaning Services</h2>
          <p className="text-sm text-[#AA88AAAAC]">24 professionals found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-[#FF4444A22] text-[#FFEEFF8E8] rounded-full text-sm whitespace-nowrap">All</button>
        <button className="px-4 py-2 bg-[#FFEEFF8E8] rounded-full text-sm whitespace-nowrap">Top Rated</button>
        <button className="px-4 py-2 bg-[#FFEEFF8E8] rounded-full text-sm whitespace-nowrap">Available Today</button>
        <button className="px-4 py-2 bg-[#FFEEFF8E8] rounded-full text-sm whitespace-nowrap">Price: Low-High</button>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border-2 border-[#FFEEFF8E8] rounded-lg p-4 hover:border-[#FF4444A22] cursor-pointer">
            <div className="flex">
              <div className="w-20 h-20 bg-[#EE44EE2E3] rounded-lg mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-bold">Ana Silva {i === 1 && <span className="text-xs bg-[#FF4444A22] text-[#FF4444A22] px-2 py-1 rounded-full ml-1">Top Pro</span>}</div>
                    <div className="flex items-center text-sm">
                      <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
                      <span className="font-semibold mr-1">4.8</span>
                      <span className="text-[#AA88AAAAC]">(89)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">$22</div>
                    <div className="text-xs text-[#AA88AAAAC]">per hour</div>
                  </div>
                </div>
                <div className="flex items-center text-xs text-[#AA88AAAAC] mb-2">
                  <Shield size={12} className="mr-1" />
                  <span>Verified • 3 years exp</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-xs bg-[#FF4444A22] text-[#FF4444A22] px-2 py-1 rounded">Cleaning</span>
                  <span className="text-xs bg-[#FF4444A22] text-[#FF4444A22] px-2 py-1 rounded">English</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfessionalProfileScreen() {
  return (
    <div className="pb-20">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#FF4444A22] to-[#FF4444A22]">
        <button className="absolute top-4 left-4 w-10 h-10 bg-[#FFEEFF8E8] rounded-full flex items-center justify-center">←</button>
      </div>

      <div className="px-4 -mt-16">
        {/* Profile Card */}
        <div className="bg-[#FFEEFF8E8] rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-start mb-3">
            <div className="w-24 h-24 bg-[#EE44EE2E3] rounded-full mr-4 border-4 border-[#FFEEFF8E8]"></div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h2 className="text-xl font-bold mr-2">Maria Rodriguez</h2>
                <span className="bg-[#FF4444A22] text-[#FF4444A22] text-xs px-2 py-1 rounded-full">Top Pro</span>
              </div>
              <div className="flex items-center mb-2">
                <Star size={16} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
                <span className="font-bold mr-1">4.9</span>
                <span className="text-[#AA88AAAAC] text-sm">(127 reviews)</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-[#FF4444A22] text-[#FF4444A22] px-2 py-1 rounded">Available Today</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="text-center">
              <div className="font-bold text-lg">3+</div>
              <div className="text-xs text-[#AA88AAAAC]">Years Exp</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">127</div>
              <div className="text-xs text-[#AA88AAAAC]">Bookings</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">100%</div>
              <div className="text-xs text-[#AA88AAAAC]">Response</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-[#FFEEFF8E8] rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold mb-2">About Me</h3>
          <p className="text-sm text-[#116611616]">
            Professional house cleaner with 3+ years experience. I take pride in my work and treat every home with respect. Fluent in English and Spanish.
          </p>
        </div>

        {/* Services & Pricing */}
        <div className="bg-[#FFEEFF8E8] rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold mb-3">Services & Pricing</h3>
          <div className="space-y-2">
            {[
              { name: 'House Cleaning', price: '$25/hr' },
              { name: 'Deep Cleaning', price: '$35/hr' },
              { name: 'Laundry & Ironing', price: '$20/hr' }
            ].map(service => (
              <div key={service.name} className="flex justify-between items-center p-2 bg-[#FFEEFF8E8] rounded">
                <span className="text-sm">{service.name}</span>
                <span className="font-semibold text-[#FF4444A22]">{service.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-[#FFEEFF8E8] rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="border-b pb-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-[#EE44EE2E3] rounded-full mr-2"></div>
                  <div>
                    <div className="font-semibold text-sm">John D.</div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={12} className="text-[#FF4444A22] fill-[#FF4444A22]" />
                      ))}
                    </div>
                  </div>
                  <div className="ml-auto text-xs text-[#AA88AAAAC]">2 days ago</div>
                </div>
                <p className="text-sm text-[#116611616]">Excellent service! Very professional and thorough. Highly recommend.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFEEFF8E8] border-t p-4 shadow-lg">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Book Now
        </button>
      </div>
    </div>
  );
}

function CreateBookingScreen() {
  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button className="mr-3">←</button>
        <h2 className="text-xl font-bold">Create Booking</h2>
      </div>

      {/* Professional Summary */}
      <div className="bg-[#FF4444A22] rounded-lg p-3 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-semibold">Maria Rodriguez</div>
            <div className="text-sm text-[#AA88AAAAC]">House Cleaning • $25/hr</div>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Select Service</label>
        <select className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg">
          <option>House Cleaning - $25/hr</option>
          <option>Deep Cleaning - $35/hr</option>
          <option>Laundry & Ironing - $20/hr</option>
        </select>
      </div>

      {/* Date & Time */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Date & Time</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-[#EE44EE2E3] rounded-lg p-3">
            <Calendar size={16} className="text-[#EE44EE2E3] mb-1" />
            <input type="date" className="w-full text-sm" />
          </div>
          <div className="border-2 border-[#EE44EE2E3] rounded-lg p-3">
            <Clock size={16} className="text-[#EE44EE2E3] mb-1" />
            <input type="time" className="w-full text-sm" defaultValue="09:00" />
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Duration</label>
        <div className="flex gap-2">
          {['2 hrs', '3 hrs', '4 hrs', '5 hrs'].map(duration => (
            <button key={duration} className="flex-1 p-3 border-2 border-[#EE44EE2E3] rounded-lg hover:border-[#FF4444A22] hover:bg-[#FF4444A22]">
              {duration}
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Service Address</label>
        <div className="border-2 border-[#EE44EE2E3] rounded-lg p-3 flex items-center">
          <MapPin size={20} className="text-[#EE44EE2E3] mr-2" />
          <input type="text" placeholder="Enter your address" className="flex-1 outline-none" />
        </div>
      </div>

      {/* Special Instructions */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Special Instructions (Optional)</label>
        <textarea 
          className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg"
          rows="3"
          placeholder="Access codes, pets, parking instructions, specific tasks..."
        ></textarea>
      </div>

      {/* Price Summary */}
      <div className="bg-[#FFEEFF8E8] rounded-lg p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span>3 hours × $25/hr</span>
          <span className="font-semibold">$75.00</span>
        </div>
        <div className="flex justify-between mb-2 text-sm text-[#AA88AAAAC]">
          <span>Platform fee (18%)</span>
          <span>$13.50</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-[#FF4444A22]">$88.50</span>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFEEFF8E8] border-t p-4 shadow-lg">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Confirm Booking
        </button>
      </div>
    </div>
  );
}

function BookingConfirmationScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-full">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-[#FF4444A22] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-[#FF4444A22]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
      <p className="text-[#AA88AAAAC] text-center mb-8">Maria has been notified and will confirm within 24 hours</p>

      {/* Booking Details Card */}
      <div className="w-full bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-xl p-4 mb-6">
        <div className="flex items-center mb-4 pb-4 border-b">
          <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">Maria Rodriguez</div>
            <div className="text-sm text-[#AA88AAAAC]">House Cleaning</div>
            <div className="flex items-center text-sm">
              <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
              <span className="font-semibold">4.9</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm">Tuesday, Nov 5, 2025</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm">9:00 AM - 12:00 PM (3 hours)</span>
          </div>
          <div className="flex items-center">
            <MapPin size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm">123 Calle Principal, Bogotá</span>
          </div>
          <div className="flex items-center">
            <DollarSign size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm font-semibold">$88.50</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          View Booking Details
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold flex items-center justify-center">
          <MessageSquare size={18} className="mr-2" />
          Message Maria
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Add to Calendar
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-[#AA88AAAAC]">You'll receive reminders 24h and 2h before</p>
      </div>
    </div>
  );
}

// Professional Screens

function BookingRequestScreen() {
  return (
    <div className="p-4">
      {/* Notification Banner */}
      <div className="bg-[#FF4444A22] border-2 border-[#FF4444A22] rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <AlertCircle size={24} className="text-[#FF4444A22] mr-3" />
          <div>
            <div className="font-bold text-[#FF4444A22]">New Booking Request!</div>
            <div className="text-sm text-[#FF4444A22]">Respond within 24 hours</div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Customer Details</h3>
          <button className="text-[#FF4444A22] text-sm font-semibold">View Full Profile</button>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">John Martinez</div>
            <div className="flex items-center text-sm">
              <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
              <span className="font-semibold mr-1">4.7</span>
              <span className="text-[#AA88AAAAC]">(12 bookings)</span>
            </div>
            <div className="flex items-center mt-1">
              <Shield size={14} className="text-[#FF4444A22] mr-1" />
              <span className="text-xs text-[#FF4444A22] font-semibold">ID Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-3">Booking Details</h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-[#FF4444A22] rounded-lg flex items-center justify-center mr-3">
              <Calendar size={16} className="text-[#FF4444A22]" />
            </div>
            <div>
              <div className="text-sm text-[#AA88AAAAC]">Date & Time</div>
              <div className="font-semibold">Tuesday, Nov 5, 2025</div>
              <div className="font-semibold">9:00 AM - 12:00 PM</div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-[#FF4444A22] rounded-lg flex items-center justify-center mr-3">
              <Home size={16} className="text-[#FF4444A22]" />
            </div>
            <div>
              <div className="text-sm text-[#AA88AAAAC]">Service</div>
              <div className="font-semibold">House Cleaning</div>
              <div className="text-sm">3 hours</div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-[#FF4444A22] rounded-lg flex items-center justify-center mr-3">
              <MapPin size={16} className="text-[#FF4444A22]" />
            </div>
            <div>
              <div className="text-sm text-[#AA88AAAAC]">Location</div>
              <div className="font-semibold">Chapinero, Bogotá</div>
              <div className="text-sm text-[#AA88AAAAC]">~2.3 km away</div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-[#FF4444A22] rounded-lg flex items-center justify-center mr-3">
              <DollarSign size={16} className="text-[#FF4444A22]" />
            </div>
            <div>
              <div className="text-sm text-[#AA88AAAAC]">Your Earnings</div>
              <div className="font-bold text-lg text-[#FF4444A22]">$75.00</div>
              <div className="text-xs text-[#AA88AAAAC]">(Platform takes $13.50)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      <div className="bg-[#FF4444A22] border-2 border-[#FF4444A22] rounded-lg p-4 mb-4">
        <div className="font-semibold mb-2">Special Instructions:</div>
        <p className="text-sm text-[#116611616]">"Please use eco-friendly products. I have a cat. Access code is #1122334."</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Accept Booking
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold flex items-center justify-center">
          <MessageSquare size={18} className="mr-2" />
          Ask a Question
        </button>
        <button className="w-full bg-[#FFEEFF8E8] text-[#FF4444A22] border-2 border-[#FF4444A22] py-3 rounded-lg font-semibold">
          Decline
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-[#AA88AAAAC]">
        <Clock size={14} className="inline mr-1" />
        You have 22 hours to respond
      </div>
    </div>
  );
}

function CustomerProfileScreen() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button className="mr-3">←</button>
        <h2 className="text-xl font-bold">Customer Profile</h2>
      </div>

      {/* Profile Header */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <div className="flex items-center mb-4">
          <div className="w-20 h-20 bg-[#EE44EE2E3] rounded-full mr-4"></div>
          <div>
            <h3 className="font-bold text-lg">John Martinez</h3>
            <div className="flex items-center mb-1">
              <Star size={16} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
              <span className="font-bold mr-1">4.7</span>
              <span className="text-[#AA88AAAAC] text-sm">(12 reviews)</span>
            </div>
            <div className="flex items-center">
              <Shield size={14} className="text-[#FF4444A22] mr-1" />
              <span className="text-xs text-[#FF4444A22] font-semibold">ID Verified</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="font-bold">12</div>
            <div className="text-xs text-[#AA88AAAAC]">Bookings</div>
          </div>
          <div className="text-center">
            <div className="font-bold">95%</div>
            <div className="text-xs text-[#AA88AAAAC]">Completion</div>
          </div>
          <div className="text-center">
            <div className="font-bold">6 mo</div>
            <div className="text-xs text-[#AA88AAAAC]">Member</div>
          </div>
        </div>
      </div>

      {/* Property Info */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-3">Property Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#AA88AAAAC]">Type:</span>
            <span className="font-semibold">Apartment</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#AA88AAAAC]">Area:</span>
            <span className="font-semibold">Chapinero, Bogotá</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#AA88AAAAC]">Languages:</span>
            <span className="font-semibold">English, Spanish</span>
          </div>
        </div>
      </div>

      {/* Reviews from Professionals */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-3">Reviews from Professionals</h3>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="border-b pb-3">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#EE44EE2E3] rounded-full mr-2"></div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Ana Silva</div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className="text-[#FF4444A22] fill-[#FF4444A22]" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-[#AA88AAAAC]">1 week ago</div>
              </div>
              <p className="text-sm text-[#116611616]">Very respectful and clear with instructions. Home was clean and well-maintained. Would work for again!</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Accept This Customer
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Back to Request
        </button>
      </div>
    </div>
  );
}

function AcceptBookingScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-full">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-[#FF4444A22] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-[#FF4444A22]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Booking Accepted!</h2>
      <p className="text-[#AA88AAAAC] text-center mb-8">John has been notified. Details added to your calendar.</p>

      {/* Booking Card */}
      <div className="w-full bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-xl p-4 mb-6">
        <div className="flex items-center mb-4 pb-4 border-b">
          <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">John Martinez</div>
            <div className="text-sm text-[#AA88AAAAC]">House Cleaning</div>
            <div className="flex items-center text-sm">
              <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
              <span className="font-semibold">4.7</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm">Tuesday, Nov 5, 2025</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm">9:00 AM - 12:00 PM (3 hours)</span>
          </div>
          <div className="flex items-center">
            <MapPin size={16} className="text-[#EE44EE2E3] mr-2" />
            <span className="text-sm">Chapinero, Bogotá</span>
          </div>
          <div className="flex items-center">
            <DollarSign size={16} className="text-[#FF4444A22] mr-2" />
            <span className="text-sm font-semibold text-[#FF4444A22]">You earn: $75.00</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          View My Calendar
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold flex items-center justify-center">
          <MessageSquare size={18} className="mr-2" />
          Message John
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Get Directions
        </button>
      </div>

      <div className="mt-8 bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-3 w-full">
        <p className="text-sm text-center">
          <strong>Remember:</strong> Check in when you arrive to start tracking your time
        </p>
      </div>
    </div>
  );
}

function CheckInScreen() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
        <p className="text-[#AA88AAAAC]">Check in to begin your service</p>
      </div>

      {/* Customer Info */}
      <div className="bg-[#FF4444A22] border-2 border-[#FF4444A22] rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">John Martinez</div>
            <div className="text-sm text-[#AA88AAAAC]">House Cleaning • 3 hours</div>
          </div>
        </div>
      </div>

      {/* Location Verification */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-3">Verify Location</h3>
        <div className="bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-3 mb-3">
          <div className="flex items-center text-[#FF4444A22]">
            <CheckCircle size={20} className="mr-2" />
            <span className="font-semibold">You're at the right location!</span>
          </div>
        </div>
        <div className="text-sm text-[#AA88AAAAC]">
          <MapPin size={16} className="inline mr-1" />
          Calle 60 #10-45, Chapinero
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-3">Service Details</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#AA88AAAAC]">Scheduled Time:</span>
            <span className="font-semibold">9:00 AM - 12:00 PM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#AA88AAAAC]">Your Rate:</span>
            <span className="font-semibold">$25/hour</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#AA88AAAAC]">Expected Earnings:</span>
            <span className="font-bold text-[#FF4444A22]">$75.00</span>
          </div>
        </div>
      </div>

      {/* Special Instructions Reminder */}
      <div className="bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-3 mb-6">
        <div className="font-semibold text-sm mb-1">📋 Special Instructions:</div>
        <p className="text-sm text-[#116611616]">Use eco-friendly products. Cat in house. Access code: #1122334</p>
      </div>

      {/* Check-in Button */}
      <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-4 rounded-lg font-bold text-lg mb-3">
        Check In & Start Service
      </button>

      {/* Emergency Contact */}
      <div className="text-center">
        <button className="text-[#FF4444A22] font-semibold text-sm">
          Report Problem / Emergency
        </button>
      </div>

      {/* Info Footer */}
      <div className="mt-6 bg-[#FFEEFF8E8] rounded-lg p-3">
        <p className="text-xs text-[#AA88AAAAC] text-center">
          Your time will be tracked from check-in. Customer will be notified when you arrive.
        </p>
      </div>
    </div>
  );
}

function CompleteServiceScreen() {
  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Complete Service</h2>
        <p className="text-[#AA88AAAAC]">Finish and rate your customer</p>
      </div>

      {/* Time Tracking */}
      <div className="bg-[#FF4444A22] border-2 border-[#FF4444A22] rounded-lg p-4 mb-4">
        <div className="text-center mb-3">
          <div className="text-sm text-[#AA88AAAAC] mb-1">Service Duration</div>
          <div className="text-4xl font-bold text-[#FF4444A22]">3h 05m</div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#AA88AAAAC]">Check-in: 9:00 AM</span>
          <span className="text-[#AA88AAAAC]">Now: 12:05 PM</span>
        </div>
      </div>

      {/* Service Notes */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-2">Service Notes (Optional)</h3>
        <textarea 
          className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg text-sm"
          rows="3"
          placeholder="Add any notes about the work completed, issues found, recommendations..."
        ></textarea>
      </div>

      {/* Photos */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-2">Before/After Photos (Optional)</h3>
        <div className="grid grid-cols-3 gap-2">
          <button className="aspect-square border-2 border-dashed border-[#EE44EE2E3] rounded-lg flex items-center justify-center hover:border-[#FF4444A22]">
            <Camera size={24} className="text-[#EE44EE2E3]" />
          </button>
          <div className="aspect-square bg-[#FFEEFF8E8] rounded-lg"></div>
          <div className="aspect-square bg-[#FFEEFF8E8] rounded-lg"></div>
        </div>
      </div>

      {/* Rate Customer */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-3">Rate Customer</h3>
        
        <div className="space-y-3">
          {['Respectfulness', 'Communication', 'Property Condition', 'Payment Promptness'].map(category => (
            <div key={category}>
              <div className="text-sm text-[#AA88AAAAC] mb-1">{category}</div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} className="w-10 h-10 border-2 border-[#EE44EE2E3] rounded-lg hover:border-[#FF4444A22] hover:bg-[#FF4444A22]">
                    <Star size={20} className="text-[#EE44EE2E3] mx-auto" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Written Review */}
      <div className="bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-4">
        <h3 className="font-bold mb-2">Review (Optional)</h3>
        <textarea 
          className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg text-sm"
          rows="3"
          placeholder="Share your experience working with John..."
        ></textarea>
      </div>

      {/* Earnings Summary */}
      <div className="bg-[#FF4444A22] border-2 border-[#FF4444A22] rounded-lg p-4 mb-20">
        <div className="flex justify-between mb-2">
          <span className="text-sm">3.08 hours × $25/hr</span>
          <span className="font-semibold">$77.00</span>
        </div>
        <div className="flex justify-between mb-2 text-sm text-[#AA88AAAAC]">
          <span>Platform fee (18%)</span>
          <span>-$13.86</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>Your Earnings</span>
          <span className="text-[#FF4444A22]">$63.14</span>
        </div>
        <div className="text-xs text-[#AA88AAAAC] mt-2">
          Payment processed in 2 hours. Payout on Friday.
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFEEFF8E8] border-t p-4 shadow-lg">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Check Out & Submit
        </button>
      </div>
    </div>
  );
}

// Onboarding Screens

function ApplyScreen() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Apply to Join</h2>
        <p className="text-[#AA88AAAAC]">Start your journey as a trusted professional</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-semibold text-sm mb-1 block">Full Name</label>
          <input type="text" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="Maria Rodriguez" />
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">ID Number</label>
          <input type="text" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="Cédula de Ciudadanía" />
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Phone Number</label>
          <input type="tel" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="+57 300 123 4567" />
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Email</label>
          <input type="email" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="maria@email.com" />
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Services You Offer</label>
          <div className="grid grid-cols-2 gap-2">
            {['Cleaning', 'Cooking', 'Laundry', 'Ironing', 'Organization', 'Deep Clean'].map(service => (
              <label key={service} className="flex items-center p-2 border-2 border-[#EE44EE2E3] rounded-lg cursor-pointer hover:border-[#FF4444A22]">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{service}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Years of Experience</label>
          <select className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg">
            <option>Less than 1 year</option>
            <option>1-2 years</option>
            <option>3-5 years</option>
            <option>5+ years</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Expected Hourly Rate (USD)</label>
          <input type="number" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="25" />
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Reference 1 - Name & Phone</label>
          <input type="text" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg mb-2" placeholder="Name" />
          <input type="tel" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="Phone" />
        </div>

        <div>
          <label className="font-semibold text-sm mb-1 block">Reference 2 - Name & Phone</label>
          <input type="text" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg mb-2" placeholder="Name" />
          <input type="tel" className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg" placeholder="Phone" />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FFEEFF8E8] border-t p-4 shadow-lg">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Continue to Documents
        </button>
      </div>
    </div>
  );
}

function UploadDocsScreen() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
        <p className="text-[#AA88AAAAC]">We need to verify your identity</p>
      </div>

      <div className="space-y-4">
        {/* ID Upload */}
        <div className="bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold">Government ID</div>
              <div className="text-sm text-[#AA88AAAAC]">Cédula or Passport</div>
            </div>
            <span className="text-[#FF4444A22] text-sm font-semibold">Required</span>
          </div>
          <button className="w-full border-2 border-dashed border-[#EE44EE2E3] rounded-lg p-6 hover:border-[#FF4444A22]">
            <Camera size={32} className="text-[#EE44EE2E3] mx-auto mb-2" />
            <div className="text-sm text-[#AA88AAAAC]">Tap to upload or take photo</div>
          </button>
        </div>

        {/* Proof of Address */}
        <div className="bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold">Proof of Address</div>
              <div className="text-sm text-[#AA88AAAAC]">Utility bill or lease</div>
            </div>
            <span className="text-[#FF4444A22] text-sm font-semibold">Required</span>
          </div>
          <button className="w-full border-2 border-dashed border-[#EE44EE2E3] rounded-lg p-6 hover:border-[#FF4444A22]">
            <Camera size={32} className="text-[#EE44EE2E3] mx-auto mb-2" />
            <div className="text-sm text-[#AA88AAAAC]">Tap to upload or take photo</div>
          </button>
        </div>

        {/* Optional Certifications */}
        <div className="bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold">Certifications</div>
              <div className="text-sm text-[#AA88AAAAC]">Professional certificates (if any)</div>
            </div>
            <span className="text-[#AA88AAAAC] text-sm font-semibold">Optional</span>
          </div>
          <button className="w-full border-2 border-dashed border-[#EE44EE2E3] rounded-lg p-6 hover:border-[#FF4444A22]">
            <Camera size={32} className="text-[#EE44EE2E3] mx-auto mb-2" />
            <div className="text-sm text-[#AA88AAAAC]">Tap to upload</div>
          </button>
        </div>
      </div>

      <div className="mt-6 bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-4">
        <div className="text-sm text-[#FF4444A22]">
          <strong>What happens next?</strong>
          <ul className="mt-2 space-y-1 ml-4">
            <li>• Background check (3-5 business days)</li>
            <li>• Reference verification</li>
            <li>• You'll be contacted to schedule an interview</li>
          </ul>
        </div>
      </div>

      <button className="w-full mt-6 bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
        Submit Documents
      </button>
    </div>
  );
}

function InterviewScheduleScreen() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="w-16 h-16 bg-[#FF4444A22] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-[#FF4444A22]" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Documents Approved!</h2>
        <p className="text-[#AA88AAAAC] text-center">Schedule your in-person interview</p>
      </div>

      <div className="bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-4 mb-6">
        <div className="font-semibold mb-2">What to expect:</div>
        <ul className="text-sm space-y-1">
          <li>• 30-minute interview at our office</li>
          <li>• Bring your original ID documents</li>
          <li>• Professional photo will be taken</li>
          <li>• Learn about platform policies</li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3">Available Interview Slots</h3>
        
        <div className="space-y-3">
          {[
            { date: 'Mon, Nov 4', time: '10:00 AM', available: true },
            { date: 'Mon, Nov 4', time: '2:00 PM', available: true },
            { date: 'Tue, Nov 5', time: '11:00 AM', available: true },
            { date: 'Tue, Nov 5', time: '3:00 PM', available: false },
            { date: 'Wed, Nov 6', time: '9:00 AM', available: true },
          ].map((slot, idx) => (
            <button
              key={idx}
              disabled={!slot.available}
              className={`w-full p-4 rounded-lg border-2 text-left ${
                slot.available
                  ? 'border-[#EE44EE2E3] hover:border-[#FF4444A22] hover:bg-[#FF4444A22]'
                  : 'border-[#FFEEFF8E8] bg-[#FFEEFF8E8] opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{slot.date}</div>
                  <div className="text-sm text-[#AA88AAAAC]">{slot.time}</div>
                </div>
                {slot.available ? (
                  <ChevronRight className="text-[#EE44EE2E3]" />
                ) : (
                  <span className="text-sm text-[#AA88AAAAC]">Booked</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#FFEEFF8E8] rounded-lg p-4">
        <div className="flex items-start">
          <MapPin size={20} className="text-[#AA88AAAAC] mr-2 mt-1" />
          <div>
            <div className="font-semibold">Interview Location</div>
            <div className="text-sm text-[#AA88AAAAC]">Calle 72 #10-51, Oficina 302</div>
            <div className="text-sm text-[#AA88AAAAC]">Chapinero, Bogotá</div>
            <button className="text-[#FF4444A22] text-sm font-semibold mt-1">Get Directions</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProfileScreen() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Your Profile</h2>
        <p className="text-[#AA88AAAAC]">This is how customers will see you</p>
      </div>

      <div className="space-y-6">
        {/* Profile Photo */}
        <div>
          <label className="font-semibold mb-2 block">Profile Photo</label>
          <div className="flex items-center">
            <div className="w-24 h-24 bg-[#EE44EE2E3] rounded-full mr-4"></div>
            <button className="px-4 py-2 bg-[#FF4444A22] text-[#FFEEFF8E8] rounded-lg text-sm">
              Upload Photo
            </button>
          </div>
          <p className="text-xs text-[#AA88AAAAC] mt-2">Professional photo from your interview will be used</p>
        </div>

        {/* Bio */}
        <div>
          <label className="font-semibold mb-2 block">About Me</label>
          <textarea
            className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg"
            rows="4"
            placeholder="Tell customers about your experience, approach to work, and what makes you great..."
          ></textarea>
          <div className="text-xs text-[#AA88AAAAC] text-right">0 / 300 characters</div>
        </div>

        {/* Services & Rates */}
        <div>
          <label className="font-semibold mb-2 block">Services & Your Rates</label>
          <div className="space-y-2">
            {[
              { service: 'House Cleaning', suggested: '$20-30/hr' },
              { service: 'Deep Cleaning', suggested: '$25-40/hr' },
              { service: 'Laundry & Ironing', suggested: '$15-25/hr' }
            ].map(item => (
              <div key={item.service} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <div className="flex-1 font-medium text-sm">{item.service}</div>
                <input
                  type="number"
                  className="w-20 p-2 border-2 border-[#EE44EE2E3] rounded text-sm"
                  placeholder="25"
                />
                <span className="text-sm text-[#AA88AAAAC]">/hr</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#AA88AAAAC] mt-2">Suggested rates shown. You can set your own.</p>
        </div>

        {/* Availability */}
        <div>
          <label className="font-semibold mb-2 block">Weekly Availability</label>
          <div className="space-y-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5" defaultChecked={day !== 'Sunday'} />
                <div className="flex-1 text-sm">{day}</div>
                <input type="time" className="p-2 border-2 border-[#EE44EE2E3] rounded text-sm" defaultValue="08:00" />
                <span className="text-sm">to</span>
                <input type="time" className="p-2 border-2 border-[#EE44EE2E3] rounded text-sm" defaultValue="17:00" />
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="font-semibold mb-2 block">Languages</label>
          <div className="space-y-2">
            {['Spanish', 'English', 'Portuguese'].map(lang => (
              <label key={lang} className="flex items-center">
                <input type="checkbox" className="w-5 h-5 mr-2" defaultChecked={lang === 'Spanish'} />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Areas */}
        <div>
          <label className="font-semibold mb-2 block">Work Areas (Neighborhoods)</label>
          <input
            type="text"
            className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg mb-2"
            placeholder="e.g., Chapinero, Usaquén, Santa Fe..."
          />
          <p className="text-xs text-[#AA88AAAAC]">List neighborhoods you're willing to work in</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FFEEFF8E8] border-t p-4 shadow-lg">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Submit Profile for Review
        </button>
      </div>
    </div>
  );
}

function ProfileLiveScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-full">
      <div className="w-24 h-24 bg-[#FF4444A22] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-[#FF4444A22]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Welcome Aboard! 🎉</h2>
      <p className="text-[#AA88AAAAC] text-center mb-8">Your profile is now live and customers can find you</p>

      <div className="w-full bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-xl p-4 mb-6">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-[#EE44EE2E3] rounded-full mx-auto mb-3"></div>
          <div className="font-bold text-lg">Maria Rodriguez</div>
          <div className="flex items-center justify-center text-sm">
            <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
            <span>New Professional</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#AA88AAAAC]">Services:</span>
            <span className="font-semibold">3 services</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#AA88AAAAC]">Rate:</span>
            <span className="font-semibold">$25/hour</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#AA88AAAAC]">Status:</span>
            <span className="text-[#FF4444A22] font-semibold">✓ Active</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3 mb-6">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          View My Profile
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Go to Dashboard
        </button>
      </div>

      <div className="w-full bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-4">
        <div className="font-semibold mb-2">💡 Tips to Get Started:</div>
        <ul className="text-sm space-y-1">
          <li>• Keep your availability up to date</li>
          <li>• Respond to bookings within 24 hours</li>
          <li>• Provide excellent service for great reviews</li>
          <li>• Build your reputation over time</li>
        </ul>
      </div>
    </div>
  );
}

// Customer Rating Flow

function ServiceCompleteScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-full">
      <div className="w-24 h-24 bg-[#FF4444A22] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-[#FF4444A22]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Service Complete!</h2>
      <p className="text-[#AA88AAAAC] text-center mb-8">Maria has finished the cleaning service</p>

      <div className="w-full bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-xl p-4 mb-6">
        <div className="flex items-center mb-4 pb-4 border-b">
          <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">Maria Rodriguez</div>
            <div className="text-sm text-[#AA88AAAAC]">House Cleaning</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#AA88AAAAC]">Duration:</span>
            <span className="font-semibold">3 hours 5 minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#AA88AAAAC]">Amount:</span>
            <span className="font-semibold">$88.50</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-4 mb-6">
        <p className="text-sm text-center text-[#FF4444A22]">
          Your payment will be processed in 2 hours. Please rate your experience to help others!
        </p>
      </div>

      <div className="w-full space-y-3">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Rate Service
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          View Booking Details
        </button>
        <button className="w-full bg-[#FFEEFF8E8] text-[#FF4444A22] border-2 border-[#FF4444A22] py-3 rounded-lg font-semibold">
          Report an Issue
        </button>
      </div>
    </div>
  );
}

function RateProfessionalScreen() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Rate Your Experience</h2>
        <p className="text-[#AA88AAAAC]">Help others make informed decisions</p>
      </div>

      {/* Professional Summary */}
      <div className="bg-[#FF4444A22] rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">Maria Rodriguez</div>
            <div className="text-sm text-[#AA88AAAAC]">House Cleaning • 3 hours</div>
          </div>
        </div>
      </div>

      {/* Rating Categories */}
      <div className="space-y-6 mb-6">
        {[
          { name: 'Quality of Work', icon: '✨' },
          { name: 'Punctuality', icon: '⏰' },
          { name: 'Professionalism', icon: '👔' },
          { name: 'Communication', icon: '💬' }
        ].map(category => (
          <div key={category.name}>
            <div className="font-semibold mb-2 flex items-center">
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className="w-12 h-12 border-2 border-[#EE44EE2E3] rounded-lg hover:border-[#FF4444A22] hover:bg-[#FF4444A22] flex items-center justify-center"
                >
                  <Star size={24} className="text-[#EE44EE2E3]" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Rating Display */}
      <div className="bg-[#FFEEFF8E8] rounded-lg p-4 mb-6 text-center">
        <div className="text-sm text-[#AA88AAAAC] mb-1">Overall Rating</div>
        <div className="text-4xl font-bold text-[#FF4444A22]">4.5</div>
        <div className="flex justify-center mt-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} size={20} className={star <= 4 ? "text-[#FF4444A22] fill-[#FF4444A22]" : "text-[#EE44EE2E3]"} />
          ))}
        </div>
      </div>

      {/* Written Review */}
      <div className="mb-6">
        <label className="font-semibold mb-2 block">Written Review (Optional)</label>
        <textarea
          className="w-full p-3 border-2 border-[#EE44EE2E3] rounded-lg"
          rows="4"
          placeholder="Share details about your experience to help other customers..."
        ></textarea>
        <div className="text-xs text-[#AA88AAAAC] text-right">0 / 500 characters</div>
      </div>

      {/* Photos */}
      <div className="mb-20">
        <label className="font-semibold mb-2 block">Add Photos (Optional)</label>
        <div className="grid grid-cols-4 gap-2">
          <button className="aspect-square border-2 border-dashed border-[#EE44EE2E3] rounded-lg flex items-center justify-center hover:border-[#FF4444A22]">
            <Camera size={24} className="text-[#EE44EE2E3]" />
          </button>
          <div className="aspect-square bg-[#FFEEFF8E8] rounded-lg"></div>
          <div className="aspect-square bg-[#FFEEFF8E8] rounded-lg"></div>
          <div className="aspect-square bg-[#FFEEFF8E8] rounded-lg"></div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#FFEEFF8E8] border-t p-4 shadow-lg">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Submit Review
        </button>
      </div>
    </div>
  );
}

function AddTipScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-full">
      <div className="w-24 h-24 bg-[#FF4444A22] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-[#FF4444A22]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Thanks for Your Review!</h2>
      <p className="text-[#AA88AAAAC] text-center mb-8">Would you like to add a tip for Maria?</p>

      {/* Professional Card */}
      <div className="w-full bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-[#EE44EE2E3] rounded-full mr-3"></div>
          <div>
            <div className="font-bold">Maria Rodriguez</div>
            <div className="flex items-center">
              <Star size={14} className="text-[#FF4444A22] fill-[#FF4444A22] mr-1" />
              <span className="font-semibold">4.5</span>
              <span className="text-[#AA88AAAAC] text-sm ml-1">(your rating)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tip Options */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['10%', '15%', '20%'].map(percent => (
            <button
              key={percent}
              className="p-4 border-2 border-[#EE44EE2E3] rounded-lg hover:border-[#FF4444A22] hover:bg-[#FF4444A22]"
            >
              <div className="font-bold text-lg">{percent}</div>
              <div className="text-sm text-[#AA88AAAAC]">
                ${(88.50 * parseFloat(percent) / 100).toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        <div className="border-2 border-[#EE44EE2E3] rounded-lg p-4">
          <label className="text-sm text-[#AA88AAAAC] block mb-2">Custom Amount</label>
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">$</span>
            <input
              type="number"
              className="flex-1 text-2xl font-bold outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="w-full bg-[#FF4444A22] border border-[#FF4444A22] rounded-lg p-3 mb-6">
        <p className="text-sm text-center text-[#FF4444A22]">
          💙 100% of your tip goes directly to Maria
        </p>
      </div>

      <div className="w-full space-y-3">
        <button className="w-full bg-[#FF4444A22] text-[#FFEEFF8E8] py-3 rounded-lg font-semibold">
          Add Tip
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Skip for Now
        </button>
      </div>
    </div>
  );
}

function PaymentConfirmedScreen() {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-full">
      <div className="w-24 h-24 bg-[#FF4444A22] rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-[#FF4444A22]" />
      </div>

      <h2 className="text-2xl font-bold mb-2">All Set!</h2>
      <p className="text-[#AA88AAAAC] text-center mb-8">Payment processed successfully</p>

      {/* Receipt Card */}
      <div className="w-full bg-[#FFEEFF8E8] border-2 border-[#FFEEFF8E8] rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-sm text-[#AA88AAAAC] mb-1">Receipt #11223345</div>
          <div className="text-xs text-[#AA88AAAAC]">Nov 5, 2025 • 12:15 PM</div>
        </div>

        <div className="border-t border-b py-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#AA88AAAAC]">Service (3.08 hrs × $25)</span>
            <span>$77.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#AA88AAAAC]">Platform fee (18%)</span>
            <span>$13.86</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#AA88AAAAC]">Tip (15%)</span>
            <span>$13.28</span>
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold">
          <span>Total Charged</span>
          <span className="text-[#FF4444A22]">$104.14</span>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <div className="flex items-center justify-center text-sm text-[#AA88AAAAC]">
            <CreditCard size={16} className="mr-2" />
            Visa •••• 4242
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 mb-6">
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Download Receipt
        </button>
        <button className="w-full bg-[#FFEEFF8E8] border-2 border-[#EE44EE2E3] py-3 rounded-lg font-semibold">
          Book Maria Again
        </button>
      </div>

      {/* Thank You Message */}
      <div className="w-full bg-gradient-to-br from-[#FF4444A22] to-[#FF4444A22] rounded-lg p-4">
        <p className="text-center text-sm">
          <strong>Thanks for using our platform!</strong><br />
          Your review helps our community grow 💙
        </p>
      </div>
    </div>
  );
}

export default WireframeApp;