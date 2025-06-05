'use client';
import { useState } from 'react';
import { FaFileAlt, FaSearch, FaUsers, FaLock, FaRegChartBar, FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <main>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-morocco-500 text-2xl font-bold">PV Manager</h1>
            </Link>
          </div>
          
          {/* Menu pour desktop */}
          <div className="desktop-menu">
            <Link href="/documentation" className="text-gray-600">Documentation</Link>
            <Link href="/contact" className="text-gray-600">Contact</Link>
            <Link href="/api/auth/signin">
              <button className="btn btn-primary">Se connecter</button>
            </Link>
            <Link href="/register">
              <button className="btn btn-outline">S'inscrire</button>
            </Link>
          </div>
          
          {/* Bouton toggle pour mobile */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        {/* Menu mobile */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="container">
            <Link href="/documentation" className="text-gray-600">Documentation</Link>
            <Link href="/contact" className="text-gray-600">Contact</Link>
            <Link href="/api/auth/signin" className="mt-4">
              <button className="btn btn-primary" style={{ width: '100%' }}>Se connecter</button>
            </Link>
            <Link href="/register" className="mt-4">
              <button className="btn btn-outline" style={{ width: '100%' }}>S'inscrire</button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* En-tête */}
      <header className="header">
        <div className="container">
          <div className="row">
            <div className="col col-6">
              <div className="header-content">
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#6333e4' }}>
                  Gestion simplifiée des PV d'assemblée générale
                </h1>
                <p className="text-xl mb-6 text-gray-600">
                  Une solution intuitive pour rédiger, modifier et exporter vos procès-verbaux en toute simplicité
                </p>
                <div>
                  <Link href="/register">
                    <button className="btn btn-primary mr-4">
                      Commencer gratuitement
                    </button>
                  </Link>
                  <Link href="/documentation">
                    <button className="btn btn-outline">
                      En savoir plus
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col col-6">
              <div className="header-image text-center">
                <img 
                  src="https://placehold.co/600x400/e9f5ff/2196f3?text=PV+Manager" 
                  alt="Aperçu PV Manager" 
                  className="rounded-lg shadow-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Section Fonctionnalités */}
      <section className="features-section">
        <div className="container">
          <h2 className="text-center mb-10 text-3xl font-bold" style={{ color: '#6333e4' }}>
            Fonctionnalités principales
          </h2>
          
          <div className="row">
            <div className="col col-4">
              <div className="card text-center">
                <div className="feature-icon">
                  <FaFileAlt size={40} color="#7c4dff" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Création de PV
                </h3>
                <p className="text-gray-600">
                  Rédigez facilement vos procès-verbaux à l'aide de modèles personnalisables
                </p>
              </div>
            </div>
            
            <div className="col col-4">
              <div className="card text-center">
                <div className="feature-icon">
                  <FaUsers size={40} color="#7c4dff" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Gestion des membres
                </h3>
                <p className="text-gray-600">
                  Suivez la présence des membres et leurs interventions lors des assemblées
                </p>
              </div>
            </div>
            
            <div className="col col-4">
              <div className="card text-center">
                <div className="feature-icon">
                  <FaSearch size={40} color="#7c4dff" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  Recherche avancée
                </h3>
                <p className="text-gray-600">
                  Retrouvez rapidement vos documents grâce à notre système de recherche performant
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Avantages */}
      <section className="section-pattern py-4">
        <div className="container">
          <h2 className="text-center mt-10 mb-10 text-3xl font-bold" style={{ color: '#6333e4' }}>
            Pourquoi choisir PV Manager ?
          </h2>
          
          <div className="row">
            <div className="col col-6">
              <div className="card">
                <div className="flex mb-4">
                  <div className="mr-4">
                    <FaLock size={32} color="#7c4dff" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Sécurité et confidentialité
                    </h3>
                    <p className="text-gray-600">
                      Vos documents sont stockés de manière sécurisée et accessibles uniquement aux personnes autorisées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col col-6">
              <div className="card">
                <div className="flex mb-4">
                  <div className="mr-4">
                    <FaRegChartBar size={32} color="#7c4dff" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Suivi et statistiques
                    </h3>
                    <p className="text-gray-600">
                      Obtenez des analyses détaillées sur vos assemblées et suivez l'évolution de vos décisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col col-3">
              <h3 className="text-xl font-bold mb-4 text-white">
                PV Manager
              </h3>
              <p className="text-gray-400 mb-4">
                La solution idéale pour la gestion des procès-verbaux de vos assemblées générales.
              </p>
            </div>
            
            <div className="col col-3">
              <h4 className="text-lg font-bold mb-4 text-white">
                Liens utiles
              </h4>
              <ul className="footer-links">
                <li><Link href="/">Accueil</Link></li>
                <li><Link href="/features">Fonctionnalités</Link></li>
                <li><Link href="/pricing">Tarifs</Link></li>
                <li><Link href="/documentation">Documentation</Link></li>
              </ul>
            </div>
            
            <div className="col col-3">
              <h4 className="text-lg font-bold mb-4 text-white">
                Support
              </h4>
              <ul className="footer-links">
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/support">Support technique</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/status">État du service</Link></li>
              </ul>
            </div>
            
            <div className="col col-3">
              <h4 className="text-lg font-bold mb-4 text-white">
                Légal
              </h4>
              <ul className="footer-links">
                <li><Link href="/terms">Conditions d'utilisation</Link></li>
                <li><Link href="/privacy">Politique de confidentialité</Link></li>
                <li><Link href="/cookies">Gestion des cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p> 2024 PV Manager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
