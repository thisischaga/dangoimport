#!/usr/bin/env node

/**
 * Script de génération de sitemap dynamique pour Dangoimport
 * Génère un sitemap XML avec tous les produits et catégories
 * Usage: node scripts/generate-sitemap.js
 * Usage (silencieux): node scripts/generate-sitemap.js --quiet
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://dangoimport-server.onrender.com';
const SITE_URL = 'https://dangoimport.com';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Déterminer si le mode silencieux est activé
const QUIET_MODE = process.argv.includes('--quiet');

// Logger avec mode silencieux
function log(message) {
  if (!QUIET_MODE) {
    console.log(message);
  }
}

// Fonction pour récupérer les données de l'API
async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération de ${endpoint}:`, error.message);
    return null;
  }
}

// Génère une URL XML valide
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Crée une entry URL
function createUrlEntry(loc, changefreq = 'weekly', priority = 0.7, lastmod = null) {
  let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) {
    entry += `    <lastmod>${lastmod}</lastmod>\n`;
  }
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  entry += `  </url>\n`;
  return entry;
}

// Fonction principale
async function generateSitemap() {
  let urls = '';

  // 1. URLs statiques principales
  console.log('📄 Ajout des pages principales...');
  urls += createUrlEntry(SITE_URL, 'daily', 1.0);
  urls += createUrlEntry(`${SITE_URL}/contact`, 'monthly', 0.7);
  urls += createUrlEntry("business.dangoimport.com", 'monthly', 0.8);

  // 2. Récupérer les catégories
  try {
    const categoriesResponse = await fetchFromAPI('/api/categories');
    if (categoriesResponse && Array.isArray(categoriesResponse)) {
      categoriesResponse.forEach(category => {
        const slug = String(category._id || category.name)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        urls += createUrlEntry(`${SITE_URL}/category/${slug}`, 'weekly', 0.8);
      });
    } 
  } catch (error) {
    console.error('   ❌ Erreur lors de la récupération des catégories:', error.message);
  }

  // 3. Récupérer les produits publiés
  try {
    let page = 1;
    let allProducts = [];
    let hasMore = true;
    const limit = 100;

    while (hasMore && page <= 10) {
      // Limite à 1000 produits pour éviter les timeouts
      const productsResponse = await fetchFromAPI(
        `/api/products?isPublished=true&limit=${limit}&page=${page}`
      );

      if (productsResponse && Array.isArray(productsResponse.data)) {
        allProducts = allProducts.concat(productsResponse.data);
        hasMore = productsResponse.hasMore || false;
        page++;
      } else {
        hasMore = false;
      }
    }

    // Ajouter chaque produit au sitemap
    allProducts.forEach(product => {
      if (product._id && product.name) {
        const slug = String(product.name)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .substring(0, 100);
        const lastmod = product.updatedAt
          ? new Date(product.updatedAt).toISOString().split('T')[0]
          : null;
        urls += createUrlEntry(
          `${SITE_URL}/product/${product._id}/${slug}`,
          'weekly',
          0.7,
          lastmod
        );
      }
    });
  } catch (error) {
    console.error('   ❌ Erreur lors de la récupération des produits:', error.message);
  }

  // Générer le XML final
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${urls}</urlset>`;

  // Écrire le fichier
  try {
    fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
    const fileSize = fs.statSync(OUTPUT_PATH).size;
    //console.log(`📁 Fichier: ${OUTPUT_PATH}`);
    //console.log(`📊 Taille: ${(fileSize / 1024).toFixed(2)} KB`);
    //console.log(`🔗 URLs: ${(urls.match(/<url>/g) || []).length}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture du fichier:', error.message);
    process.exit(1);
  }
}

// Exécuter
generateSitemap().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
