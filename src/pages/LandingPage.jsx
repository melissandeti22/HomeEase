import { Link } from 'react-router-dom';
import { SparklesIcon, BoltIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white text-gray-800 min-h-screen">
      {/* 🔹 NAVBAR */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-700">HomeEase</h1>
        <div className="space-x-6">
          <a href="#home" className="hover:text-blue-600">Home</a>
          <a href="#services" className="hover:text-blue-600">Services</a>
          <a href="#how" className="hover:text-blue-600">How It Works</a>
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login / Register</Link>
        </div>
      </nav>

      {/* 🔹 HERO SECTION */}
      <section id="home" className="flex flex-col-reverse md:flex-row items-center px-6 py-20">
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-5xl font-extrabold text-blue-800 leading-tight mb-4">
            Find a Plumber Fast, <br /> Easy & Reliable.
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            HomeEase helps you connect with trusted plumbers near you in Nairobi.
          </p>
          <Link to="/register">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold shadow-md hover:bg-blue-700 transition">
              Get Started
            </button>
          </Link>
        </div>
        <div className="md:w-1/2 mb-10 md:mb-0">
          <img
            src="/plumber.JPG"
            alt="Plumber illustration"
            className="w-full max-w-sm mx-auto md:max-w-full rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* 🔹 SERVICES */}
      <section id="services" className="px-6 py-16 bg-gray-100 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-10">What We Offer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BoltIcon className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Instant Booking</h4>
            <p>Book available plumbers in real-time and get help fast.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <SparklesIcon className="w-10 h-10 text-purple-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Verified Experts</h4>
            <p>All plumbers are rated and reviewed by residents.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold mb-2">Localized Services</h4>
            <p>Exclusive to Nairobi’s residential neighborhoods.</p>
          </div>
        </div>
      </section>

      {/* 🔹 HOW IT WORKS */}
      <section id="how" className="px-6 py-16 bg-white text-center">
        <h3 className="text-3xl font-bold mb-10">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['1', 'Create Account', 'Sign up as a resident or plumber.'],
            ['2', 'Book or Accept Job', 'Residents book, plumbers respond.'],
            ['3', 'Service Complete', 'Track the work and get it done.']
          ].map(([step, title, desc]) => (
            <div key={step} className="p-6 border border-gray-200 rounded shadow hover:shadow-lg transition">
              <span className="text-blue-600 text-4xl font-extrabold">{step}</span>
              <h4 className="text-xl font-semibold mt-3 mb-2">{title}</h4>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 GUEST VIEW */}
      <section className="px-6 py-12 text-center bg-blue-50">
        <h3 className="text-2xl font-semibold mb-4">Just Looking Around?</h3>
        <Link to="/guest-view">
          <button className="px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition">
            Continue as Guest
          </button>
        </Link>
      </section>

      {/* 🔹 FOOTER */}
      <footer className="bg-white py-6 text-center text-sm text-gray-500 border-t">
        &copy; {new Date().getFullYear()} HomeEase. All Rights Reserved
      </footer>
    </div>
  );
};

export default LandingPage;
