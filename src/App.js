import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import WishlistPanel from './components/WishlistPanel';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Hotels from './pages/Hotels';
import NearMe from './pages/NearMe';
import SearchResults from './pages/SearchResults';
import './App.css';

function AppShell() {
  const { darkMode } = useApp();

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Header />
      <WishlistPanel />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/near-me" element={<NearMe />} />
          <Route path="/search" element={<SearchResults />} />
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
