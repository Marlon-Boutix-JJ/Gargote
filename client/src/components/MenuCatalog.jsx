import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['Tous', 'Entrées', 'Plats', 'Grillades', 'Boissons', 'Desserts'];

export const MenuCatalog = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    searchTerm, 
    setSearchTerm, 
    addToCart 
  } = useApp();

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-card">
      <div className="catalog-controls">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un plat, une boisson..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="categories-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="product-card">
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-img" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
              }}
            />
            <div className="product-info">
              <div>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
              </div>

              <div className="product-footer">
                <span className="product-price">{product.price.toLocaleString()} Ar</span>
                <button 
                  className="add-btn"
                  onClick={() => addToCart(product)}
                >
                  <Plus size={16} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
