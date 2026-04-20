import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaImage, FaSearch } from 'react-icons/fa';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { adminApi } from '../../api/adminApi.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Get server base URL for images
  const getServerBase = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const SERVER_BASE = getServerBase();
  const FALLBACK_IMG = 'https://dummyimage.com/200x200/e5e7eb/111827.png?text=No+Image';

  const getProductImage = (product) => {
    const image = product?.imageUrl || product?.image || product?.images?.[0] || '';
    if (!image) return FALLBACK_IMG;
    if (image.startsWith('/')) return `${SERVER_BASE}${image}`;
    if (image.startsWith('http')) return image;
    return FALLBACK_IMG;
  };

  const [categories, setCategories] = useState(['All']);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          adminApi.getAllProducts(),
          adminApi.getCategories()
        ]);

        const prodData = prodRes.data?.data || [];
        const catData = catRes.data?.data || [];

        setProducts(prodData);
        setCategories(['All', ...catData.map(c => c.name)]);
        filterProducts(prodData, searchQuery, selectedCategory);
      } catch (error) {
        console.error('Failed to fetch product data:', error);
        toast.error('Failed to load products or categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products
  const filterProducts = (productList, query, category) => {
    let filtered = productList;

    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(products, query, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(products, searchQuery, category);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      // await adminApi.deleteProduct(deleteTarget._id);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p._id !== deleteTarget._id));
      setFilteredProducts(filteredProducts.filter(p => p._id !== deleteTarget._id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button
          onClick={() => navigate('/admin/products/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <FaPlus /> Add New Product
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or subcategory..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full font-medium transition ${selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition">
              {/* Product Image */}
              <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold">INACTIVE</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Category & Subcategory */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <Badge className="bg-blue-100 text-blue-800">
                    {product.category}
                  </Badge>
                  {product.subcategory && (
                    <Badge className="bg-green-100 text-green-800">
                      {product.subcategory}
                    </Badge>
                  )}
                </div>

                {/* Price and Unit */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Unit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.unit}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <Badge
                    className={`${product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-between">
                  <button
                    onClick={() => navigate(`/admin/products/${product._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(product);
                      setDeleteConfirmOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setDeleteConfirmOpen(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
