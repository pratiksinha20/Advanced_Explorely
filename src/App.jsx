import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WishlistPanel from './components/WishlistPanel';
import FeedbackModal from './components/FeedbackModal';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Hotels from './pages/Hotels';
import NearMe from './pages/NearMe';
import SpinAndGo from './pages/SpinAndGo';
import SplitExpenses from './pages/SplitExpenses';
import SearchResults from './pages/SearchResults';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Disclaimer from './pages/Disclaimer';
import Contact from './pages/Contact';
import ExplorelyLoader from './components/ExplorelyLoader';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    // Only scroll to top if not navigating to a specific hash on the page
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}

function AppShell() {
  const { darkMode } = useApp();

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <ScrollToTop />
      <ExplorelyLoader />
      <Header />
      <WishlistPanel />
      <FeedbackModal />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/near-me" element={<NearMe />} />
          <Route path="/spin-go" element={<SpinAndGo />} />
          <Route path="/split" element={<SplitExpenses />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </Router>
  );
}

export default App;
