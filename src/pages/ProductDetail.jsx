import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';
import { resolveImageUrl } from '../utils/imageUrl';
import { useProduct, useSimilarProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    FaShoppingCart,
    FaHeart,
    FaStar,
    FaArrowLeft,
    FaCheckCircle,
    FaFileAlt,
    FaPlay,
    FaTruck,
    FaShieldAlt,
    FaRulerCombined,
    FaTag,
    FaStore,
    FaChevronRight,
    FaBox,
} from 'react-icons/fa';

const PLACEHOLDER_IMG =
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage indisponible%3C/text%3E%3C/svg%3E';

const getImgUrl = (img) => resolveImageUrl(img) || '';

const buildGallery = (product) => {
    if (!product) return [];
    const gallery = [];

    if (product.images?.length) {
        product.images.forEach((img) => {
            const url = getImgUrl(img.url || img);
            if (url) gallery.push({ url, alt: img.alt || product.name });
        });
    }

    if (gallery.length === 0 && product.image) {
        gallery.push({ url: getImgUrl(product.image), alt: product.name });
    }

    return gallery;
};

const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
};

const toOptionList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') {
        return val.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
};

const StarRow = ({ value = 0, size = 16 }) => (
    <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                size={size}
                className={i < Math.round(value) ? 'text-[#ffdc2b]' : 'text-gray-300'}
            />
        ))}
    </div>
);

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: product, isLoading: loading, isError: productLoadError } = useProduct(id);
    const { data: similarProducts = [] } = useSimilarProducts(id);
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedCustomOptions, setSelectedCustomOptions] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [inWishlist, setInWishlist] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        if (product?.variants?.length > 0 && !selectedVariant) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product, selectedVariant]);

    useEffect(() => {
        // Réinitialiser les options personnalisées quand on change de variante
        setSelectedCustomOptions({});
    }, [selectedVariant?._id, selectedVariant?.id]);

    const error = useMemo(() => {
        if (loading) return '';
        if (productLoadError || !product) return 'Produit non trouvé.';
        if (product.isPublished === false) return 'Ce produit n\'est plus disponible.';
        return '';
    }, [loading, productLoadError, product]);

    const gallery = useMemo(() => {
        let g = buildGallery(product);
        if (selectedVariant?.image) {
            const vImg = getImgUrl(selectedVariant.image);
            const idx = g.findIndex(i => i.url === vImg);
            if (idx === -1) {
                g = [{ url: vImg, alt: selectedVariant.name }, ...g];
            } else if (idx > 0) {
                const [item] = g.splice(idx, 1);
                g.unshift(item);
            }
        }
        return g;
    }, [product, selectedVariant]);

    const customPriceAdjustment = useMemo(() => {
        if (!product?.isCustomizable || !product.parameters?.length) return 0;
        let adj = 0;
        product.parameters.forEach((param) => {
            const selected = selectedCustomOptions[param.name];
            if (selected) {
                const option = param.options?.find((o) => o.value === selected);
                if (option?.priceAdjustment) adj += option.priceAdjustment;
            }
        });
        return adj;
    }, [product, selectedCustomOptions]);

    const variantPriceAdjustment = useMemo(() => {
        if (!selectedVariant || !selectedVariant.parameters?.length) return 0;
        let adj = 0;
        selectedVariant.parameters.forEach((param) => {
            const selected = selectedCustomOptions[param.name];
            if (selected) {
                const option = param.options?.find((o) => o.value === selected);
                if (option?.priceAdjustment) adj += option.priceAdjustment;
            }
        });
        return adj;
    }, [selectedVariant, selectedCustomOptions]);

    const basePrice = product ? product.salePrice || product.price : 0;
    const effectivePrice = selectedVariant 
        ? (selectedVariant.price + variantPriceAdjustment) 
        : (basePrice + customPriceAdjustment);

    const discount = useMemo(() => {
        if (!product || product.price <= 0 || selectedVariant) return 0;
        return Math.round(
            ((product.price - (product.salePrice || product.price)) / product.price) * 100
        );
    }, [product, selectedVariant]);

    const dimensionFields = useMemo(() => {
        if (!product) return [];
        const fields = [];
        if (product.weight) fields.push({ label: 'Poids', value: product.weight });
        if (product.length) fields.push({ label: 'Longueur', value: product.length });
        if (product.width) fields.push({ label: 'Largeur', value: product.width });
        if (product.height) fields.push({ label: 'Hauteur', value: product.height });
        if (product.material) fields.push({ label: 'Matériau', value: product.material });
        return fields;
    }, [product]);

    const productColors = useMemo(() => toOptionList(product?.color), [product?.color]);
    const productSizes = useMemo(() => toOptionList(product?.size), [product?.size]);

    const { maxQuantity, inStock } = useMemo(() => {
        const raw = selectedVariant ? selectedVariant.stock : product?.stock;
        const stock = Number(raw);
        if (raw === undefined || raw === null || !Number.isFinite(stock)) {
            return { maxQuantity: 99, inStock: true };
        }
        return { maxQuantity: Math.max(0, stock), inStock: stock > 0 };
    }, [product?.stock, selectedVariant]);

    const isLowStock = product && inStock && (selectedVariant ? selectedVariant.stock : product.stock) <= (product.minStock || 10);

    const infoCards = useMemo(() => {
        if (!product) return [];
        return [
            product.brand && { label: 'Marque', value: product.brand },
            product.category && { label: 'Catégorie', value: product.category },
            product.subCategory && { label: 'Sous-catégorie', value: product.subCategory },
            product.weight && { label: 'Poids', value: product.weight },
            product.condition && { label: 'État', value: product.condition },
        ].filter(Boolean);
    }, [product]);

    const quickSpecs = useMemo(() => {
        if (!product?.specifications?.length) return [];
        return product.specifications.slice(0, 4);
    }, [product]);

    const fetchReviews = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}/reviews`);
            const data = await response.json();
            if (data.success) setReviews(data.data || []);
        } catch (err) {
            console.error('Erreur fetchReviews :', err);
        }
    }, [id]);

    const checkWishlist = useCallback(async () => {
        try {
            const token = localStorage.getItem('dangoToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                const isIn = data.data.items?.some((item) => item.productId._id === id);
                setInWishlist(isIn || false);
            }
        } catch (err) {
            console.error('Erreur checkWishlist :', err);
        }
    }, [id]);

    useEffect(() => {
        if (product?.seoTitle || product?.name) {
            document.title = `${product.seoTitle || product.name} | Dango Import`;
        }
        return () => { document.title = 'Dango Import'; };
    }, [product]);

    // Réinitialiser le formulaire à chaque changement de produit (données via React Query)
    useEffect(() => {
        window.scrollTo(0, 0);
        setQuantity(1);
        setSelectedColor('');
        setSelectedSize('');
        setSelectedCustomOptions({});
        setSelectedVariant(null);
        setActiveTab('description');
        setSelectedImage(0);
        fetchReviews();
        checkWishlist();
    }, [id, fetchReviews, checkWishlist]);

    const buildCartItem = useCallback(() => {
        const primaryImage = gallery[0]?.url || getImgUrl(product?.image);
        return {
            ...product,
            price: effectivePrice,
            salePrice: selectedVariant ? selectedVariant.price : (product.salePrice ?? product.price),
            image: primaryImage,
            selectedOptions: {
                color: selectedColor,
                size: selectedSize,
                ...selectedCustomOptions,
                variant: selectedVariant ? selectedVariant.name : undefined,
            },
            variantId: selectedVariant?._id,
        };
    }, [product, effectivePrice, gallery, selectedColor, selectedSize, selectedCustomOptions, selectedVariant]);

    const validateBeforeCart = () => {
        if (!product) return false;

        if (!inStock) {
            toast.warning('Ce produit est en rupture de stock.');
            return false;
        }

        if (productColors.length > 0 && !selectedColor) {
            toast.warning('Veuillez choisir une couleur.');
            return false;
        }

        if (productSizes.length > 0 && !selectedSize) {
            toast.warning('Veuillez choisir une taille.');
            return false;
        }

        if (product.isCustomizable && product.parameters?.length > 0) {
            const missing = product.parameters.find((p) => !selectedCustomOptions[p.name]);
            if (missing) {
                toast.warning(`Veuillez choisir : ${missing.name}.`);
                return false;
            }
        }

        if (selectedVariant?.parameters?.length > 0) {
            const missing = selectedVariant.parameters.find((p) => !selectedCustomOptions[p.name]);
            if (missing) {
                toast.warning(`Veuillez choisir l'option "${missing.name}" pour ce modèle.`);
                return false;
            }
        }

        if (quantity < 1) {
            toast.warning('La quantité doit être au minimum 1.');
            return false;
        }

        if (quantity > maxQuantity) {
            toast.warning('Quantité supérieure au stock disponible.');
            return false;
        }

        return true;
    };

    const handleAddToCart = () => {
        if (!validateBeforeCart()) return;
        addToCart(buildCartItem(), quantity);
    };

    const handleBuyNow = () => {
        if (!validateBeforeCart()) return;
        addToCart(buildCartItem(), quantity);
        navigate('/checkout');
    };

    const handleWishlist = async () => {
        const token = localStorage.getItem('dangoToken');
        if (!token) {
            navigate('/login');
            return;
        }

        if (!product) return;

        try {
            const endpoint = inWishlist
                ? `${API_BASE_URL}/api/wishlist/remove/${id}`
                : `${API_BASE_URL}/api/wishlist/add/${id}`;
            const method = inWishlist ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setInWishlist(!inWishlist);
                toast.success(
                    inWishlist
                        ? 'Produit retiré de votre liste de souhaits.'
                        : 'Produit ajouté à votre liste de souhaits.'
                );
            } else {
                toast.error(data.message || 'Erreur lors de la mise à jour de la liste de souhaits.');
            }
        } catch (err) {
            console.error('Erreur handleWishlist :', err);
            toast.error('Erreur lors de la mise à jour de la liste de souhaits.');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh] bg-[#f8f9fa]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Chargement du produit...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <div className="flex items-center justify-center min-h-[60vh] bg-[#f8f9fa]">
                    <div className="text-center">
                        <p className="text-gray-700 font-medium mb-4">
                            {error || 'Produit non trouvé'}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/shopping')}
                            className="btn-brand px-6 py-2 rounded-lg text-sm"
                        >
                            Retour à la boutique
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const tabs = [
        { id: 'description', label: 'Description' },
        ...(product.specifications?.length || product.features?.length || dimensionFields.length
            ? [{ id: 'specs', label: 'Caractéristiques' }]
            : []),
        { id: 'reviews', label: `Avis (${product.totalReviews || reviews.length || 0})` },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
            <Header />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/shopping')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-3"
                    >
                        <FaArrowLeft size={14} />
                        Retour à la boutique
                    </button>
                    <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
                        <Link to="/shopping" className="hover:text-gray-900">Boutique</Link>
                        {product.category && (
                            <>
                                <FaChevronRight size={8} className="text-gray-300" />
                                <span className="text-gray-700">{product.category}</span>
                            </>
                        )}
                        {product.subCategory && (
                            <>
                                <FaChevronRight size={8} className="text-gray-300" />
                                <span className="text-gray-700">{product.subCategory}</span>
                            </>
                        )}
                        <FaChevronRight size={8} className="text-gray-300" />
                        <span className="text-gray-700 font-medium truncate max-w-[200px]">
                            {product.name}
                        </span>
                    </nav>
                </div>

            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Galerie */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                        <div className="relative mb-4">
                            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                                {gallery.length > 0 ? (
                                    <img
                                        src={gallery[selectedImage]?.url}
                                        alt={gallery[selectedImage]?.alt || product.name}
                                        className="w-full h-full object-contain p-4"
                                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <FaBox size={48} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Pas d&apos;image disponible</p>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-[#2d3748] text-[#ffdc2b] px-3 py-1 rounded-md font-bold text-sm">
                                        -{discount}%
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                                    {product.isFeatured && (
                                        <span className="bg-[#fffbeb] text-[#2d3748] border border-[#ffdc2b]/40 text-xs px-2.5 py-1 rounded-md font-semibold">
                                            Coup de cœur
                                        </span>
                                    )}
                                    {product.isNewArrival && (
                                        <span className="bg-gray-900 text-white text-xs px-2.5 py-1 rounded-md font-medium">
                                            Nouveau
                                        </span>
                                    )}
                                    {product.isBestSeller && (
                                        <span className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2.5 py-1 rounded-md font-medium">
                                            Best-seller
                                        </span>
                                    )}
                                </div>
                            </div>

                            {gallery.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                                    {gallery.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${
                                                selectedImage === idx
                                                    ? 'border-gray-900 ring-1 ring-gray-900'
                                                    : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.alt || `Vue ${idx + 1}`}
                                                className="w-full h-full object-contain bg-gray-50"
                                                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {product.videos?.length > 0 && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaPlay className="text-gray-400" size={12} />
                                    Vidéos
                                </h3>
                                <div className="space-y-3">
                                    {product.videos.map((videoUrl, idx) => {
                                        const embed = getVideoEmbedUrl(videoUrl);
                                        return embed ? (
                                            <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-black">
                                                <iframe
                                                    src={embed}
                                                    title={`Vidéo ${idx + 1}`}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <a
                                                key={idx}
                                                href={videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline"
                                            >
                                                <FaPlay size={10} />
                                                Voir la vidéo {idx + 1}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Infos produit */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                        <div className="mb-4">
                            {product.brand && (
                                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            {product.shortDescription && (
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                    {product.shortDescription}
                                </p>
                            )}

                            {infoCards.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                    {infoCards.map((item) => (
                                        <div key={item.label} className="bg-[#fffbeb] border border-[#ffdc2b]/25 rounded-lg px-3 py-2">
                                            <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">{item.label}</p>
                                            <p className="text-sm font-semibold text-[#2d3748] truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {product.features?.length > 0 && (
                                <ul className="mb-4 space-y-1.5">
                                    {product.features.slice(0, 4).map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <FaCheckCircle className="text-[#ffdc2b] mt-0.5 flex-shrink-0" size={13} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                                {product.vendorName && (
                                    <Link
                                        to={`/vendor/${encodeURIComponent(product.vendorName)}`}
                                        className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium hover:border-gray-900 hover:text-gray-900 transition"
                                    >
                                        <FaStore size={10} />
                                        {product.vendorName}
                                    </Link>
                                )}
                                {product.sku && (
                                    <span className="text-xs text-gray-400">Réf. {product.sku}</span>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                            <StarRow value={product.rating || 0} />
                            <span className="text-sm text-gray-600">
                                {(product.rating || 0).toFixed(1)}/5
                                <span className="text-gray-400 ml-1">
                                    ({product.totalReviews || reviews.length || 0} avis)
                                </span>
                            </span>
                            {product.totalSales > 0 && (
                                <span className="text-sm text-gray-400">
                                    • {product.totalSales} vendu{product.totalSales > 1 ? 's' : ''}
                                </span>
                            )}
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {product.condition || 'Neuf'}
                            </span>
                        </div>

                        {/* Prix */}
                        <div className="mb-5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    {effectivePrice.toLocaleString('fr-FR')} F
                                </span>
                                {discount > 0 && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {product.price.toLocaleString('fr-FR')} F
                                    </span>
                                )}
                                {customPriceAdjustment > 0 && (
                                    <span className="text-xs text-gray-500">
                                        (base {basePrice.toLocaleString('fr-FR')} F + options)
                                    </span>
                                )}
                            </div>
                            {product.shippingInfo && (
                                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1.5">
                                    <FaTruck className="text-gray-400" size={12} />
                                    {product.shippingInfo}
                                </p>
                            )}
                            {discount > 0 && (
                                <p className="text-xs text-green-700 font-semibold mt-2">
                                    Économisez {(product.price - (product.salePrice || product.price)).toLocaleString('fr-FR')} F
                                </p>
                            )}
                        </div>

                        {quickSpecs.length > 0 && (
                            <div className="mb-5 p-4 bg-white border border-gray-100 rounded-xl">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    En bref
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {quickSpecs.map((spec, idx) => (
                                        <div key={idx}>
                                            <p className="text-[11px] text-gray-400">{spec.key}</p>
                                            <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-0.5">Disponibilité</p>
                                <p className={`font-semibold text-sm ${inStock ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {inStock
                                        ? `${maxQuantity} en stock`
                                        : 'Rupture de stock'}
                                </p>
                                {isLowStock && (
                                    <p className="text-xs text-gray-500 mt-0.5">Stock limité</p>
                                )}
                            </div>
                            {product.warranty && (
                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                                        <FaShieldAlt size={10} className="text-gray-400" />
                                        Garantie
                                    </p>
                                    <p className="font-semibold text-sm text-gray-900">
                                        {product.warranty}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div className="mb-5 flex flex-wrap gap-1.5">
                                {product.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                                    >
                                        <FaTag size={8} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Variantes indépendantes */}
                        {product.variants?.length > 0 && (
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Option / Modèle
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => {
                                        const isSelected = selectedVariant?._id === variant._id || selectedVariant?.id === variant.id;
                                        return (
                                            <button
                                                key={variant._id || variant.id}
                                                type="button"
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition ${
                                                    isSelected
                                                        ? 'border-[#2d3748] bg-[#2d3748]/5'
                                                        : 'border-gray-200 hover:border-[#e6c600]/50'
                                                }`}
                                            >
                                                {variant.image && (
                                                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-gray-100">
                                                        <img
                                                            src={getImgUrl(variant.image)}
                                                            alt={variant.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <span className={`text-xs font-semibold ${isSelected ? 'text-[#2d3748]' : 'text-gray-600'}`}>
                                                    {variant.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Couleurs */}
                        {productColors.length > 0 && (
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Couleur
                                    {selectedColor && (
                                        <span className="font-normal text-gray-500 ml-2">
                                            : {selectedColor}
                                        </span>
                                    )}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {productColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                                                selectedColor === color
                                                    ? 'border-[#2d3748] bg-[#2d3748] text-white'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#e6c600]/50 hover:bg-[#fffbeb]'
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tailles */}
                        {productSizes.length > 0 && (
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Taille
                                    {selectedSize && (
                                        <span className="font-normal text-gray-500 ml-2">
                                            : {selectedSize}
                                        </span>
                                    )}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {productSizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${
                                                selectedSize === size
                                                    ? 'border-[#2d3748] bg-[#2d3748] text-white'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#e6c600]/50 hover:bg-[#fffbeb]'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Options personnalisables globales */}
                        {product.isCustomizable && product.parameters?.length > 0 && (
                            <div className="mb-5 space-y-4">
                                {product.parameters.map((param) => (
                                    <div key={param.name}>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            {param.name}
                                            <span className="text-gray-900 ml-0.5">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {param.options?.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedCustomOptions((prev) => ({
                                                            ...prev,
                                                            [param.name]: opt.value,
                                                        }))
                                                    }
                                                    className={`px-3 py-2 rounded-lg text-sm transition border-2 ${
                                                        selectedCustomOptions[param.name] === opt.value
                                                            ? 'border-[#2d3748] bg-[#2d3748] text-white'
                                                            : 'border-gray-200 text-gray-700 hover:border-[#e6c600]/50 hover:bg-[#fffbeb]'
                                                    }`}
                                                >
                                                    {opt.value}
                                                    {opt.priceAdjustment > 0 && (
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            (+{opt.priceAdjustment.toLocaleString('fr-FR')} F)
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sous-paramètres spécifiques au modèle/variante sélectionné */}
                        {selectedVariant?.parameters?.length > 0 && (
                            <div className="mb-5 space-y-4">
                                {selectedVariant.parameters.map((param) => (
                                    <div key={param.name}>
                                        <label className="block text-sm font-semibold text-[#2d3748] mb-2">
                                            {param.name}
                                            <span className="text-[#2d3748] ml-0.5">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {param.options?.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedCustomOptions((prev) => ({
                                                            ...prev,
                                                            [param.name]: opt.value,
                                                        }))
                                                    }
                                                    className={`px-3 py-2 rounded-lg text-sm transition border-2 ${
                                                        selectedCustomOptions[param.name] === opt.value
                                                            ? 'border-[#2d3748] bg-[#2d3748]/5 text-[#2d3748] shadow-sm'
                                                            : 'border-gray-200 text-gray-700 hover:border-[#e6c600]/50 hover:bg-[#fffbeb]'
                                                    }`}
                                                >
                                                    {opt.value}
                                                    {opt.priceAdjustment > 0 && (
                                                        <span className={`text-xs ml-1 font-semibold ${selectedCustomOptions[param.name] === opt.value ? 'text-[#2d3748]' : 'text-gray-500'}`}>
                                                            (+{opt.priceAdjustment.toLocaleString('fr-FR')} F)
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantité */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Quantité
                            </label>
                            <div className="flex items-center gap-3 w-fit">
                                <button
                                    type="button"
                                    disabled={!inStock}
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    disabled={!inStock}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (isNaN(val) || val <= 0) setQuantity(1);
                                        else setQuantity(Math.min(maxQuantity, val));
                                    }}
                                    min="1"
                                    max={maxQuantity}
                                    className="w-16 h-10 text-center border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-gray-900 disabled:opacity-40"
                                />
                                <button
                                    type="button"
                                    disabled={!inStock}
                                    onClick={() =>
                                        setQuantity((q) => Math.min(maxQuantity, q + 1))
                                    }
                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                            {!inStock && (
                                <p className="text-sm text-red-600 mt-2">Produit en rupture de stock.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className="flex-1 btn-brand disabled:bg-gray-200 disabled:text-gray-400 py-3 rounded-xl transition flex items-center justify-center gap-2"
                            >
                                <FaShoppingCart size={18} />
                                Ajouter au panier
                            </button>
                            <button
                                type="button"
                                onClick={handleWishlist}
                                className={`w-12 h-12 rounded-xl border transition flex items-center justify-center ${
                                    inWishlist
                                        ? 'border-[#2d3748] bg-[#2d3748] text-[#ffdc2b]'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                                }`}
                            >
                                <FaHeart size={20} />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={!inStock}
                            className="w-full mt-3 btn-brand-outline disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl transition"
                        >
                            Acheter maintenant
                        </button>

                        {/* Dimensions rapides */}
                        {dimensionFields.length > 0 && (
                            <div className="mt-5 pt-5 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <FaRulerCombined size={11} />
                                    Dimensions & matériau
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {dimensionFields.map((f) => (
                                        <div key={f.label} className="text-sm">
                                            <span className="text-gray-500">{f.label} : </span>
                                            <span className="font-medium text-gray-800">{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Onglets : Description / Caractéristiques / Avis */}
                <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
                                    activeTab === tab.id
                                        ? 'border-[#ffdc2b] text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === 'description' && (
                            <div className="space-y-6">
                                {product.description ? (
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 text-sm">Aucune description disponible.</p>
                                )}

                                {product.features?.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">Points forts</h3>
                                        <ul className="grid sm:grid-cols-2 gap-2">
                                            {product.features.map((f, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-sm text-gray-700"
                                                >
                                                    <FaCheckCircle
                                                        className="text-gray-400 mt-0.5 flex-shrink-0"
                                                        size={14}
                                                    />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {product.documents?.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <FaFileAlt className="text-gray-400" />
                                            Documents
                                        </h3>
                                        <ul className="space-y-2">
                                            {product.documents.map((doc, idx) => (
                                                <li key={idx}>
                                                    <a
                                                        href={getImgUrl(doc)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2"
                                                    >
                                                        <FaFileAlt size={12} />
                                                        Document {idx + 1}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="space-y-6">
                                {dimensionFields.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">
                                            Dimensions & matériau
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {dimensionFields.map((f) => (
                                                <div key={f.label} className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500">{f.label}</p>
                                                    <p className="font-semibold text-gray-900">{f.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.specifications?.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">
                                            Spécifications techniques
                                        </h3>
                                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                                            {product.specifications.map((spec, idx) => (
                                                <div
                                                    key={idx}
                                                    className="grid grid-cols-2 gap-4 px-4 py-3 even:bg-gray-50"
                                                >
                                                    <span className="text-sm text-gray-500">
                                                        {spec.key}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {spec.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(product.sku || product.barcode) && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">Identifiants</h3>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            {product.sku && (
                                                <span>
                                                    <span className="text-gray-500">SKU : </span>
                                                    <span className="font-mono font-medium">{product.sku}</span>
                                                </span>
                                            )}
                                            {product.barcode && (
                                                <span>
                                                    <span className="text-gray-500">Code-barres : </span>
                                                    <span className="font-mono font-medium">{product.barcode}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                {reviews.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        Pas encore d&apos;avis pour ce produit. Soyez le premier à donner votre avis !
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((r) => (
                                            <div
                                                key={r._id}
                                                className="border border-gray-100 rounded-xl p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {r.userName || 'Client'}
                                                            </p>
                                                            {r.verified && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                    <FaCheckCircle size={10} />
                                                                    Achat vérifié
                                                                </span>
                                                            )}
                                                        </div>
                                                        {r.title && (
                                                            <p className="text-sm font-medium text-gray-800 mt-0.5">
                                                                {r.title}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <StarRow value={r.rating || 0} size={12} />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2">
                                                    {r.createdAt
                                                        ? new Date(r.createdAt).toLocaleDateString('fr-FR', {
                                                              year: 'numeric',
                                                              month: 'long',
                                                              day: 'numeric',
                                                          })
                                                        : ''}
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {r.comment}
                                                </p>
                                                {r.images?.length > 0 && (
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        {r.images.map((img, i) => (
                                                            <img
                                                                key={i}
                                                                src={getImgUrl(img)}
                                                                alt={`Photo avis ${i + 1}`}
                                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Produits similaires */}
                {similarProducts.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-5">
                            Produits similaires
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {similarProducts.map((prod) => {
                                const similarGallery = buildGallery(prod);
                                const similarPrice = prod.salePrice || prod.price;
                                return (
                                    <button
                                        key={prod._id}
                                        type="button"
                                        onClick={() => navigate(`/product/${prod._id}`)}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden text-left flex flex-col border border-gray-100"
                                    >
                                        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {similarGallery[0] ? (
                                                <img
                                                    src={similarGallery[0].url}
                                                    alt={similarGallery[0].alt || prod.name}
                                                    className="w-full h-full object-contain p-3"
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                                />
                                            ) : (
                                                <FaBox className="text-gray-200" size={32} />
                                            )}
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col">
                                            {prod.brand && (
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase">
                                                    {prod.brand}
                                                </p>
                                            )}
                                            <p className="font-semibold text-gray-900 text-sm line-clamp-2 mt-0.5">
                                                {prod.name}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <StarRow value={prod.rating || 0} size={10} />
                                            </div>
                                            <p className="text-gray-900 font-bold mt-1 text-sm">
                                                {similarPrice.toLocaleString('fr-FR')} F
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetail;
