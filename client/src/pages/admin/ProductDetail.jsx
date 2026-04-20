import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUpload, FaImage, FaSpinner } from 'react-icons/fa';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { adminApi } from '../../api/adminApi.js';
import { uploadApi } from '../../api/uploadApi.js';

export const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    unit: 'liter',
    category: 'Liquid Milk',
    subcategory: '',
    imageUrl: '',
    isActive: true
  });

  const [originalData, setOriginalData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  // Get server base URL for images
  const getServerBase = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const SERVER_BASE = getServerBase();

  const getProductImage = (product) => {
    const image = product?.imageUrl || product?.image || product?.images?.[0] || '';
    if (!image) return null;
    if (image.startsWith('/')) return `${SERVER_BASE}${image}`;
    if (image.startsWith('http')) return image;
    return null;
  };

  // Fetch product, categories and units
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchingOptions(true);

        const [prodRes, catRes, unitRes] = await Promise.all([
          adminApi.getAllProducts(),
          adminApi.getCategories(),
          adminApi.getUnits()
        ]);

        const cats = catRes.data?.data || [];
        const uns = unitRes.data?.data || [];
        setCategories(cats);
        setUnits(uns);

        const product = prodRes.data?.data?.find(p => p._id === productId);

        if (!product) {
          toast.error('Product not found');
          navigate('/admin/products');
          return;
        }

        const productImage = getProductImage(product);
        if (productImage) {
          setImagePreview(productImage);
        }

        setFormData({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          price: product.price,
          unit: product.unit,
          category: product.category,
          subcategory: product.subcategory || '',
          imageUrl: product.imageUrl || product.image || '',
          isActive: product.isActive
        });
        setOriginalData(product);
      } catch (error) {
        console.error('Failed to fetch product data:', error);
        toast.error('Failed to load product details');
        navigate('/admin/products');
      } finally {
        setLoading(false);
        setFetchingOptions(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploading(true);
      const response = await uploadApi.uploadProductImage(imageFile);
      return response.data?.data?.filePath || response.data?.data?.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price) {
      toast.error('Price is required');
      return;
    }

    try {
      setUpdating(true);

      // Upload image if selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Update product
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category,
        subcategory: formData.subcategory,
        imageUrl: imageUrl || formData.imageUrl,
        isActive: formData.isActive
      };

      await adminApi.updateProduct(productId, productData);
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FaArrowLeft /> Back to Products
          </button>
        </div>
        <Card>
          <Skeleton className="h-96" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <FaArrowLeft /> Back to Products
        </button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Section */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaImage /> Product Image
            </h2>

            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://dummyimage.com/200x200/e5e7eb/111827.png';
                    }}
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(getProductImage(originalData));
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1 text-sm"
                    >
                      Cancel Upload
                    </button>
                  )}
                </div>
              )}

              {/* File Upload Input */}
              {!imagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FaUpload className="text-3xl text-gray-400" />
                    <span className="text-gray-600 font-medium">
                      Click to upload new image
                    </span>
                    <span className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB</span>
                  </label>
                </div>
              )}

              {imagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload-change"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload-change"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Image
                  </label>
                </div>
              )}

              {/* Image URL Fallback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or use Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Information</h2>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Fresh Milk - Toned"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* SKU (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">SKU cannot be changed</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Price and Unit Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={fetchingOptions}
                >
                  {fetchingOptions ? (
                    <option>Loading units...</option>
                  ) : (
                    units.map(unit => (
                      <option key={unit._id} value={unit.name}>
                        {unit.name} ({unit.shortName})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Category and Subcategory Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={fetchingOptions}
                >
                  {fetchingOptions ? (
                    <option>Loading categories...</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g., Toned Milk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                This product is active
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <Button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {updating || uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
