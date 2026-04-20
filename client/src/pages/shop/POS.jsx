import { useMemo, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FaCreditCard, FaSync } from "react-icons/fa";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { shopApi } from "../../api/shopApi.js";
import { salesApi } from "../../api/salesApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { Bill } from "../Bill.jsx"; 

export const POS = () => {
  const [products, setProducts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("products"); // "products" or "cart"
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [upiProvider, setUpiProvider] = useState("googlepay");
  const [splitPayment, setSplitPayment] = useState(false);
  const [upiAmount, setUpiAmount] = useState(0);
  const [secondaryPayment, setSecondaryPayment] = useState("cash");
  
  // UPI Request State
  const [customerUpiId, setCustomerUpiId] = useState("");
  const [isSendingUpi, setIsSendingUpi] = useState(false);
  const [upiRequestSent, setUpiRequestSent] = useState(false);

  //  Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiry: "",
    cvv: "",
  });

  const scannerRef = useRef(null);

  // confirm remove from cart
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  // bill preview after sale
  const [billOpen, setBillOpen] = useState(false);
  const [saleData, setSaleData] = useState(null);

  // ===== Images =====
  const FALLBACK_IMG =
    "https://dummyimage.com/80x80/e5e7eb/111827.png&text=Milk";

  const LOW_STOCK_THRESHOLD = 20;

  const getStockColor = (quantity) => {
    if (quantity === 0) return "red";
    if (quantity <= LOW_STOCK_THRESHOLD) return "yellow";
    return "green";
  };

  const getStockLabel = (quantity) => {
    if (quantity === 0) return "OUT OF STOCK";
    if (quantity <= LOW_STOCK_THRESHOLD) return "LOW STOCK";
    return `${quantity}`;
  };

  // Get base server URL (remove /api from VITE_API_BASE_URL for image paths)
  const getServerBase = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    return apiUrl.replace(/\/api\/?$/, ""); // Remove trailing /api
  };

  const SERVER_BASE = getServerBase();

  const getProductImage = (invRowOrProduct) => {
    const raw =
      invRowOrProduct?.productId?.imageUrl ||
      invRowOrProduct?.productId?.image ||
      invRowOrProduct?.productId?.images?.[0] ||
      "";

    if (!raw) return FALLBACK_IMG;
    // Image path from backend like "/uploads/Products/milk.jpeg"
    if (raw.startsWith("/")) return `${SERVER_BASE}${raw}`;
    return raw;
  };

  // ===== Card helpers =====
  const onlyDigits = (v) => (v || "").replace(/\D/g, "");

  const formatCardNumber = (v) => {
    const digits = onlyDigits(v).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (v) => {
    const digits = onlyDigits(v).slice(0, 4); // MMYY
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isValidExpiry = (exp) => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    const [mm, yy] = exp.split("/").map(Number);
    if (mm < 1 || mm > 12) return false;

    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;

    if (yy < curYY) return false;
    if (yy === curYY && mm < curMM) return false;
    return true;
  };

  const validateCardDetails = () => {
    const digits = onlyDigits(cardDetails.cardNumber);
    if (digits.length !== 16) return "Enter a valid 16-digit card number";
    if (!cardDetails.nameOnCard.trim()) return "Enter name on card";
    if (!isValidExpiry(cardDetails.expiry)) return "Enter valid expiry (MM/YY)";
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) return "Enter valid CVV (3/4 digits)";
    return null;
  };

  // Function to refresh products after sale
  const refreshProducts = async () => {
    try {
      const response = await shopApi.getInventory();
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to refresh products:", error);
    }
  };

  // Fetch inventory/products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await shopApi.getInventory();
        setProducts(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error(error.response?.data?.message || "Failed to load products");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ===== Cart persistence (localStorage) =====
  useEffect(() => {
    const saved = localStorage.getItem("pos_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.log("Invalid cart in storage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pos_cart", JSON.stringify(cart));
  }, [cart]);

  // ===== Stocks =====
  const stockByProductId = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const id = p.productId?._id;
      if (id) map.set(id, p.quantity || 0);
    });
    return map;
  }, [products]);

  const productById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const id = p.productId?._id;
      if (id) map.set(id, p);
    });
    return map;
  }, [products]);

  // ===== Categories & Filtering =====
  const categories = useMemo(() => {
    const cats = new Set(
      products.map((p) => p.productId?.category).filter(Boolean)
    );
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.productId?.category === selectedCategory);
  }, [products, selectedCategory]);

  // ===== Cart actions =====
  const addToCart = (product) => {
    const pid = product.productId?._id;
    if (!pid) return;

    const availableStock = stockByProductId.get(pid) ?? 0;
    if (availableStock <= 0) {
      toast.error("Out of stock");
      return;
    }

    const existing = cart.find((item) => item.productId === pid);

    if (existing) {
      if (existing.quantity + 1 > availableStock) {
        toast.error("Not enough stock");
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === pid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: pid,
          productName: product.productId?.name,
          price: product.productId?.price || 0,
          quantity: 1,
        },
      ]);
      toast.success("Added to cart");
    }
  };

  const askRemoveFromCart = (productId) => {
    setRemoveTarget(productId);
    setConfirmRemoveOpen(true);
  };

  const removeFromCart = () => {
    setCart(cart.filter((item) => item.productId !== removeTarget));
    setRemoveTarget(null);
    setConfirmRemoveOpen(false);
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId, quantity) => {
    const availableStock = stockByProductId.get(productId) ?? 0;

    if (quantity <= 0) {
      askRemoveFromCart(productId);
      return;
    }

    if (quantity > availableStock) {
      toast.error("Quantity exceeds stock");
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // ===== Flipkart/Amazon-like price details =====
  const subtotal = useMemo(() => getTotal(), [cart]);

  // Customize later if needed:
  const discount = 0;
  const tax = 0;
  const handling = 0;

  const grandTotal = subtotal - discount + tax + handling;

  const PriceRow = ({ label, value, strong }) => (
    <div
      className={`flex justify-between text-sm ${
        strong ? "font-bold" : "text-gray-700"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );

  // UPI Request Handler
  const handleSendUpiRequest = () => {
    if (!customerUpiId.trim()) {
      return toast.error("Please enter a valid UPI ID (e.g. 9876543210@ybl)");
    }
    const amountToRequest = paymentMethod === "split" ? upiAmount : grandTotal;
    if (amountToRequest <= 0) {
      return toast.error("Invalid payment amount");
    }

    setIsSendingUpi(true);
    setUpiRequestSent(false);

    // Simulate sending payment request to customer
    setTimeout(() => {
      setIsSendingUpi(false);
      setUpiRequestSent(true);
      toast.success(
        `Payment request of ${formatCurrency(amountToRequest)} sent to ${customerUpiId}!`
      );
    }, 1500);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");

    // validate card details when card selected (non-split)
    if (!splitPayment && paymentMethod === "card") {
      const err = validateCardDetails();
      if (err) return toast.error(err);
    }

    // Validate split payment amounts
    if (splitPayment) {
      if (upiAmount <= 0 || upiAmount >= grandTotal) {
        return toast.error("UPI amount must be between 0 and total amount");
      }
    }

    setLoading(true);

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: grandTotal,
        paymentMethod: splitPayment ? "split" : paymentMethod,
        paymentDetails: splitPayment
          ? {
              upi: {
                provider: upiProvider,
                amount: upiAmount,
              },
              [secondaryPayment]: {
                amount: grandTotal - upiAmount,
              },
            }
          : {
              [paymentMethod]: {
                amount: grandTotal,
                ...(paymentMethod === "upi" && { provider: upiProvider }),
                ...(paymentMethod === "card" && {
                  last4: onlyDigits(cardDetails.cardNumber).slice(-4),
                  nameOnCard: cardDetails.nameOnCard,
                }),
              },
            },
      };

      const res = await salesApi.create(payload);

      toast.success("Sale completed!");

      const sale = res.data?.data || payload;

      const normalized = {
        ...sale,
        billNo: sale.billNo || sale.billNumber || "BILL",
        saleDate: sale.saleDate || sale.createdAt || new Date().toISOString(),
        paymentMethod: sale.paymentMethod || paymentMethod,
        items: (sale.items || payload.items || []).map((it) => ({
          ...it,
          productName:
            it.productName ||
            cart.find((c) => c.productId === it.productId)?.productName ||
            "Item",
          subtotal: it.subtotal ?? (it.price || 0) * (it.quantity || 0),
        })),
        totalAmount: sale.totalAmount ?? grandTotal,
      };

      setSaleData(normalized);

      setCart([]);
      setIsCheckoutOpen(false);
      setPaymentMethod("cash");
      setSplitPayment(false);
      setUpiAmount(0);
      setCustomerUpiId("");
      setUpiRequestSent(false);

      // reset card details after successful sale
      setCardDetails({ cardNumber: "", nameOnCard: "", expiry: "", cvv: "" });

      await refreshProducts();

      setBillOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">POS Billing</h1>

      {pageLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Tabs */}
          <div className="lg:hidden flex bg-white border border-gray-200 rounded-lg p-1 mb-4 shadow-sm">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === "products"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === "cart"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Cart
              <Badge variant={cart.length > 0 ? "blue" : "gray"} className={`${activeTab === 'cart' ? 'bg-white text-blue-600' : ''}`}>
                {cart.length}
              </Badge>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Products Grid */}
            <div className={`lg:col-span-4 ${activeTab === "products" ? "block" : "hidden"} lg:block`}>
              <Card title={`Available Products (${filteredProducts.length})`}>
                
                {/* Category Filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-lg font-semibold">
                    No products available
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    Wait for dispatch stock.
                  </p>
                </div>
              ) : (
                //  GRID FORMAT WITH PRODUCT CARDS
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredProducts.map((product) => {
                    const qty = product.quantity || 0;
                    const out = qty <= 0;
                    const img = getProductImage(product);
                    const name = product.productId?.name || "Product";
                    const price = product.productId?.price || 0;
                    const category = product.productId?.category || "";

                    return (
                      <div
                        key={product._id}
                        className={`relative group border rounded-lg overflow-hidden transition-all duration-200 ${
                          out
                            ? "opacity-50 cursor-not-allowed bg-gray-50"
                            : "hover:shadow-lg hover:scale-105 cursor-pointer bg-white"
                        }`}
                      >
                        {/* Image Container */}
                        <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                          <img
                            src={img}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.src = FALLBACK_IMG)
                            }
                          />

                          {/* Stock Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge variant={getStockColor(qty)} className="text-xs">
                              {getStockLabel(qty)}
                            </Badge>
                          </div>

                          {/* Quick Add Button - Shows on Hover */}
                          {!out && (
                            <button
                              onClick={() => addToCart(product)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                            >
                              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                                + Add
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-2">
                          <p className="text-xs text-gray-500 truncate">
                            {category}
                          </p>
                          <p className="font-semibold text-sm line-clamp-2">
                            {name}
                          </p>
                          <p className="text-sm font-bold text-green-600 mt-1">
                            {formatCurrency(price)}
                          </p>

                          {/* Click to Add Button - Mobile */}
                          <button
                            onClick={() => !out && addToCart(product)}
                            disabled={out}
                            className="w-full mt-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs rounded font-medium transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Cart Sidebar */}
          <div className={`${activeTab === "cart" ? "block" : "hidden"} lg:block`}>
            <Card title={`Cart (${cart.length})`} className="sticky top-0">
              <div className="space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-lg font-semibold">Cart is empty</div>
                    <p className="text-gray-600 text-sm mt-1">
                      Click a product to add it.
                    </p>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => {
                      const availableStock =
                        stockByProductId.get(item.productId) ?? 0;
                      const product = productById.get(item.productId);
                      const img = product
                        ? getProductImage(product)
                        : FALLBACK_IMG;
                      const itemTotal = item.price * item.quantity;

                      return (
                        <div key={item.productId} className="border-b pb-3 last:border-b-0">
                          <div className="flex gap-2 items-start mb-2">
                            <img
                              src={img}
                              alt={item.productName}
                              className="w-12 h-12 rounded object-cover border flex-shrink-0"
                              onError={(e) =>
                                (e.currentTarget.src = FALLBACK_IMG)
                              }
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-semibold text-xs line-clamp-2 flex-1">
                                  {item.productName}
                                </p>
                                <button
                                  onClick={() =>
                                    askRemoveFromCart(item.productId)
                                  }
                                  className="text-red-600 text-xs hover:text-red-800 flex-shrink-0 font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              {/* Price Breakdown */}
                              <div className="text-xs space-y-0.5 mt-1">
                                <div className="flex justify-between text-gray-700">
                                  <span>Price:</span>
                                  <span className="font-semibold">{formatCurrency(item.price)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                  <span>Qty:</span>
                                  <span className="font-semibold">{item.quantity}</span>
                                </div>
                                <div className="border-t pt-0.5 flex justify-between">
                                  <span className="font-bold text-gray-900">Total:</span>
                                  <span className="font-bold text-green-600 text-sm">{formatCurrency(itemTotal)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls - Compact Row */}
                          <div className="flex gap-1 items-center justify-between mt-2">
                            <div className="flex gap-1 items-center">
                              <button
                                className="px-1.5 py-0.5 border border-gray-300 rounded text-xs h-6 w-6 flex items-center justify-center hover:bg-gray-100 font-semibold"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                              >
                                −
                              </button>

                              <input 
                                type="number" 
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 px-1.5 py-0.5 text-xs font-bold text-center border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />

                              <button
                                className="px-1.5 py-0.5 border border-gray-300 rounded text-xs h-6 w-6 flex items-center justify-center hover:bg-blue-100 font-semibold hover:text-blue-700"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                            
                            {item.quantity >= availableStock && (
                              <span className="text-xs text-red-600 font-semibold">
                                MAX
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/*  PRICE DETAILS */}
                    <div className="border-t pt-3 mt-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-500">
                        PRICE DETAILS
                      </p>

                      <div className="flex justify-between text-xs text-gray-700">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-xs text-green-600 font-medium">
                          <span>Discount</span>
                          <span>- {formatCurrency(discount)}</span>
                        </div>
                      )}

                      {tax > 0 && (
                        <div className="flex justify-between text-xs text-gray-700">
                          <span>Tax</span>
                          <span>+ {formatCurrency(tax)}</span>
                        </div>
                      )}

                      {handling > 0 && (
                        <div className="flex justify-between text-xs text-gray-700">
                          <span>Handling</span>
                          <span>+ {formatCurrency(handling)}</span>
                        </div>
                      )}

                      <div className="border-t pt-1 mt-1 flex justify-between text-sm font-bold">
                        <span>Grand Total</span>
                        <span className="text-green-600">{formatCurrency(grandTotal)}</span>
                      </div>

                      <Button
                        onClick={() => setIsCheckoutOpen(true)}
                        disabled={cart.length === 0}
                        className="w-full mt-2 text-sm"
                      >
                        Proceed to Pay
                      </Button>

                      <button
                        className="w-full text-xs text-red-600 hover:text-red-700 mt-1"
                        onClick={clearCart}
                      >
                        Clear Cart
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </>
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        title="Select Payment Method"
        onClose={() => setIsCheckoutOpen(false)}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Bill Amount</p>
            <p className="text-4xl font-bold text-blue-700">
              {formatCurrency(grandTotal)}
            </p>
          </div>

          {/* Payment Method Selection - Flipkart Style */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Select Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* 1. UPI Payment */}
              <button
                onClick={() => {
                  setPaymentMethod("upi");
                  setSplitPayment(false);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  paymentMethod === "upi" && !splitPayment
                    ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-3xl">₹</div>
                <div className="text-center">
                  <p className="font-semibold text-sm">UPI</p>
                  <p className="text-xs text-gray-500">Google Pay, PhonePe</p>
                </div>
              </button>

              {/* 2. Card Payment */}
              <button
                onClick={() => {
                  setPaymentMethod("card");
                  setSplitPayment(false);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  paymentMethod === "card" && !splitPayment
                    ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <FaCreditCard className="text-3xl" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Card</p>
                  <p className="text-xs text-gray-500">Debit/Credit/ATM</p>
                </div>
              </button>

              {/* 3. Combined Payment */}
              <button
                onClick={() => {
                  setSplitPayment(true);
                  setPaymentMethod("split");
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  splitPayment
                    ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <FaSync className="text-3xl" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Combined</p>
                  <p className="text-xs text-gray-500">UPI + Cash/Card</p>
                </div>
              </button>

              {/* 4. Cash Payment */}
              <button
                onClick={() => {
                  setPaymentMethod("cash");
                  setSplitPayment(false);
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                  paymentMethod === "cash" && !splitPayment
                    ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-3xl">💵</div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Cash</p>
                  <p className="text-xs text-gray-500">Pay in cash</p>
                </div>
              </button>
            </div>
          </div>

          {/*  Card Payment Details (ADD HERE) */}
          {paymentMethod === "card" && !splitPayment && (
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg flex items-center gap-1"><FaCreditCard /> Card Details</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cardNumber: formatCardNumber(e.target.value),
                      }))
                    }
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card
                  </label>
                  <input
                    value={cardDetails.nameOnCard}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        nameOnCard: e.target.value,
                      }))
                    }
                    placeholder="Sayali Satam"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry (MM/YY)
                    </label>
                    <input
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          expiry: formatExpiry(e.target.value),
                        }))
                      }
                      inputMode="numeric"
                      placeholder="08/28"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          cvv: onlyDigits(e.target.value).slice(0, 4),
                        }))
                      }
                      inputMode="numeric"
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    You will be charged{" "}
                    <span className="font-bold text-gray-900">
                      {formatCurrency(grandTotal)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* UPI Provider Selection */}
          {(paymentMethod === "upi" || splitPayment) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Select UPI Provider
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "googlepay", name: "Google Pay" },
                  { id: "phonepay", name: "PhonePe" },
                  { id: "paytm", name: "Paytm" },
                  { id: "whatsapp", name: "WhatsApp Pay" },
                ].map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setUpiProvider(provider.id);
                      setUpiRequestSent(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      upiProvider === provider.id
                        ? "border-blue-600 bg-white shadow-lg ring-2 ring-blue-300"
                        : "border-gray-200 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="h-12 rounded-lg bg-gray-900 mb-2 flex items-center justify-center text-white text-lg font-bold">
                      {provider.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {provider.name}
                    </p>
                    {upiProvider === provider.id && (
                      <div className="mt-2 text-blue-600 text-xs font-semibold">
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* UPI ID Input for Request */}
              {upiProvider && (
                <div className="mt-5 pt-5 border-t border-blue-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Send Payment Request to Customer
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter customer UPI ID (e.g. 9876543210@paytm)"
                      className="flex-1 px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                      value={customerUpiId}
                      onChange={(e) => {
                        setCustomerUpiId(e.target.value);
                        if (upiRequestSent) setUpiRequestSent(false);
                      }}
                      disabled={isSendingUpi || loading}
                    />
                    <button
                      onClick={handleSendUpiRequest}
                      disabled={!customerUpiId.trim() || isSendingUpi || loading || (paymentMethod === "split" && upiAmount <= 0) }
                      className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all whitespace-nowrap ${
                        !customerUpiId.trim() || isSendingUpi
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 shadow-md"
                      }`}
                    >
                      {isSendingUpi ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                  
                  {/* Status Message */}
                  {upiRequestSent && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
                      <div className="bg-green-100 p-1 rounded-full text-green-600 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-800">Request Sent Successfully!</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Requested <strong>{formatCurrency(paymentMethod === "split" ? upiAmount : grandTotal)}</strong> from <span className="font-semibold">{customerUpiId}</span>. Please ask the customer to check their UPI app, approve the payment, and then click "Complete Payment" below.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Split Payment Details */}
          {splitPayment && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-300">
              <p className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-lg">🔀</span> Split Payment Breakdown
              </p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI Amount
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-700">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={grandTotal}
                      value={upiAmount}
                      onChange={(e) =>
                        setUpiAmount(parseFloat(e.target.value) || 0)
                      }
                      className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-semibold"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    Total Bill: {formatCurrency(grandTotal)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Payment
                  </label>
                  <select
                    value={secondaryPayment}
                    onChange={(e) => setSecondaryPayment(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none font-medium"
                    disabled={loading}
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card"><FaCreditCard /> Card</option>
                  </select>

                  <p className="text-xs text-gray-600 mt-2">
                    {secondaryPayment.charAt(0).toUpperCase() +
                      secondaryPayment.slice(1)}{" "}
                    Amount:{" "}
                    <span className="font-semibold text-green-600">
                      {formatCurrency(grandTotal - upiAmount)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleCheckout}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ||
                (splitPayment && (upiAmount <= 0 || upiAmount >= grandTotal))
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
              }`}
              disabled={
                loading ||
                (splitPayment && (upiAmount <= 0 || upiAmount >= grandTotal))
              }
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>✓</span>
                  {paymentMethod === "card" && !splitPayment
                    ? "Pay Now"
                    : "Complete Payment"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Remove Modal */}
      <Modal
        isOpen={confirmRemoveOpen}
        title="Remove Item?"
        onClose={() => setConfirmRemoveOpen(false)}
      >
        <p className="text-gray-700 mb-4">
          Do you want to remove this item from cart?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setConfirmRemoveOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={removeFromCart}>
            Remove
          </Button>
        </div>
      </Modal>

      {/* Bill Preview Modal */}
      <Modal
        isOpen={billOpen}
        title="Bill Preview"
        onClose={() => setBillOpen(false)}
      >
        <Bill billData={saleData} />
        <div className="mt-4">
          <Button className="w-full" onClick={() => window.print()}>
            Print Bill
          </Button>
        </div>
      </Modal>
    </div>
  );
};
