import React, { useState } from 'react';
import { ShoppingCart, User, MapPin, Clock, Star, Plus, Minus, Truck, CheckCircle, Play, Square, Send, Check, X } from 'lucide-react';
import { POSConfiguration, POSMenuSync, POSOrderManager } from './components/pos';
import CustomerPageEditor from './components/CustomerPageEditor';
import CustomPageView from './components/CustomPageView';
import posManager from './services/pos/POSManager';
import { POS_PROVIDERS } from './types/pos';

const DeliveryApp = () => {
    const [currentView, setCurrentView] = useState('landing');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [orderType, setOrderType] = useState('delivery');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);
    const [restaurantOwnerId, setRestaurantOwnerId] = useState(null);
    const [draggedOrder, setDraggedOrder] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [editingMenuItemId, setEditingMenuItemId] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [customerAddress, setCustomerAddress] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedItemForOptions, setSelectedItemForOptions] = useState(null);
    const [selectedRestaurantForModal, setSelectedRestaurantForModal] = useState(null);
    const [showPOSConfig, setShowPOSConfig] = useState(false);
    const [showPOSMenuSync, setShowPOSMenuSync] = useState(false);

    const [restaurants, setRestaurants] = useState([
        { id: 1, name: "Mario's Italian", cuisine: "Italian", rating: 4.8, deliveryTime: "25-35 min", deliveryFee: 2.99, image: "🍝", commissionRate: 0.15, deliveryRadius: 10, minOrderAmount: 10, isActive: true, address: "123 Pasta Lane, Athens, GA", phone: "(555) 123-4567", menu: [
                { id: 1, name: "Margherita Pizza", price: 16.99, description: "Fresh mozzarella, tomatoes, basil", category: "Pizza", options: [
                    { id: 1, name: "Size", type: "single", required: true, choices: [
                        { id: 1, name: "Small 10\"", priceModifier: -3.00 },
                        { id: 2, name: "Medium 12\"", priceModifier: 0 },
                        { id: 3, name: "Large 14\"", priceModifier: 4.00 },
                        { id: 4, name: "X-Large 16\"", priceModifier: 7.00 }
                    ]},
                    { id: 2, name: "Toppings", type: "multiple", required: false, choices: [
                        { id: 5, name: "Extra Cheese", priceModifier: 2.00 },
                        { id: 6, name: "Pepperoni", priceModifier: 2.50 },
                        { id: 7, name: "Mushrooms", priceModifier: 1.50 },
                        { id: 8, name: "Olives", priceModifier: 1.50 }
                    ]},
                    { id: 3, name: "Crust", type: "single", required: true, choices: [
                        { id: 9, name: "Regular", priceModifier: 0 },
                        { id: 10, name: "Thin", priceModifier: 0 },
                        { id: 11, name: "Stuffed Crust", priceModifier: 3.00 }
                    ]}
                ]},
                { id: 2, name: "Spaghetti Carbonara", price: 18.99, description: "Eggs, pancetta, parmesan", category: "Pasta", options: [
                    { id: 4, name: "Make it a Combo", type: "single", required: false, choices: [
                        { id: 12, name: "Add Salad & Drink", priceModifier: 4.99 },
                        { id: 13, name: "Add Garlic Bread & Drink", priceModifier: 5.99 }
                    ]}
                ]}
            ]},
        { id: 2, name: "Tokyo Sushi", cuisine: "Japanese", rating: 4.9, deliveryTime: "30-40 min", deliveryFee: 3.99, image: "🍣", commissionRate: 0.15, deliveryRadius: 10, minOrderAmount: 15, isActive: true, address: "456 Sushi St, Athens, GA", phone: "(555) 234-5678", menu: [
                { id: 4, name: "Salmon Nigiri", price: 8.99, description: "Fresh salmon", category: "Nigiri", options: [] },
                { id: 5, name: "California Roll", price: 12.99, description: "Crab, avocado", category: "Rolls", options: [] }
            ]},
        { id: 3, name: "Burger Junction", cuisine: "American", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: 1.99, image: "🍔", commissionRate: 0.15, deliveryRadius: 10, minOrderAmount: 12, isActive: true, address: "789 Burger Blvd, Athens, GA", phone: "(555) 345-6789", menu: [
                { id: 7, name: "Cheeseburger", price: 14.99, description: "Beef, cheese, lettuce", category: "Burgers", options: [
                    { id: 5, name: "Side", type: "single", required: true, choices: [
                        { id: 14, name: "Fries", priceModifier: 0 },
                        { id: 15, name: "Onion Rings", priceModifier: 1.50 },
                        { id: 16, name: "Side Salad", priceModifier: 1.00 }
                    ]},
                    { id: 6, name: "Extras", type: "multiple", required: false, choices: [
                        { id: 17, name: "Extra Patty", priceModifier: 3.50 },
                        { id: 18, name: "Bacon", priceModifier: 2.00 },
                        { id: 19, name: "Avocado", priceModifier: 1.50 }
                    ]}
                ]},
                { id: 8, name: "Chicken Sandwich", price: 13.99, description: "Crispy chicken", category: "Sandwiches", options: [] }
            ]}
    ]);

    const [platformSettings, setPlatformSettings] = useState({
        commissionRate: 0.15,
        baseDeliveryFee: 2.99,
        perMileRate: 0.50,
        taxRate: 0.08,
        minOrderAmount: 10.00,
        maxDeliveryRadius: 10,
        siteName: 'RDSware',
        logoUrl: '',
        brandColor: '#3b82f6',
        supportEmail: 'support@rdsware.com',
        supportPhone: '(555) 123-4567',
        deliveryZipCodes: '30601, 30602, 30605, 30606',
        operatingHours: '8:00 AM - 11:00 PM',
        platformFee: 0.50,
        maintenanceMode: false
    });

    const [coupons, setCoupons] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [giftCertificates, setGiftCertificates] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [appliedGiftCert, setAppliedGiftCert] = useState(null);

    const [drivers, setDrivers] = useState([
        { id: 1, name: 'Alex Johnson', status: 'available', currentLocation: { lat: 33.9519, lng: -83.3576 }, vehicle: 'Honda Civic', rating: 4.9, assignedOrders: [], avatar: '👨‍🦱' },
        { id: 2, name: 'Sarah Chen', status: 'available', currentLocation: { lat: 33.9520, lng: -83.3580 }, vehicle: 'Toyota Prius', rating: 4.8, assignedOrders: [], avatar: '👩‍🦰' },
        { id: 3, name: 'Mike Rodriguez', status: 'busy', currentLocation: { lat: 33.9510, lng: -83.3590 }, vehicle: 'Ford Focus', rating: 4.7, assignedOrders: [], avatar: '👨‍🦲' },
        { id: 4, name: 'Emma Wilson', status: 'offline', currentLocation: { lat: 33.9500, lng: -83.3570 }, vehicle: 'Nissan Altima', rating: 4.9, assignedOrders: [], avatar: '👩‍🦱' }
    ]);

    const [customPages, setCustomPages] = useState([
        {
            id: 'landing',
            title: 'Landing Page',
            slug: 'landing',
            content: '<h2>Why Choose Us?</h2><p>Fast delivery from your favorite local restaurants. Order now and enjoy delicious food delivered right to your door!</p><ul><li>Quick & Reliable Delivery</li><li>Wide Selection of Restaurants</li><li>Easy Online Ordering</li><li>Track Your Order in Real-Time</li></ul>',
            isActive: true,
            showInNav: false,
            isLandingPage: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 1,
            title: 'About Us',
            slug: 'about-us',
            content: '<h1>About Us</h1><p>Welcome to our food delivery platform! We connect you with the best local restaurants.</p>',
            isActive: true,
            showInNav: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]);

    const addToCart = (item, restaurantId, selectedOptions = {}) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);

        // Calculate price with options
        let finalPrice = item.price;
        Object.values(selectedOptions).flat().forEach(choiceId => {
            item.options?.forEach(option => {
                const choice = option.choices.find(c => c.id === choiceId);
                if (choice) {
                    finalPrice += choice.priceModifier;
                }
            });
        });

        // Create unique key based on item and selected options
        const optionsKey = JSON.stringify(selectedOptions);
        const cartItemKey = `${item.id}_${optionsKey}`;

        const existingItem = cart.find(ci => ci.cartItemKey === cartItemKey);
        if (existingItem) {
            setCart(cart.map(ci => ci.cartItemKey === cartItemKey ? { ...ci, quantity: ci.quantity + 1 } : ci));
        } else {
            setCart([...cart, {
                ...item,
                quantity: 1,
                restaurantId,
                restaurantName: restaurant.name,
                selectedOptions,
                finalPrice,
                cartItemKey
            }]);
        }
    };

    const removeFromCart = (cartItemKey) => {
        const existingItem = cart.find(ci => ci.cartItemKey === cartItemKey);
        if (existingItem && existingItem.quantity > 1) {
            setCart(cart.map(ci => ci.cartItemKey === cartItemKey ? { ...ci, quantity: ci.quantity - 1 } : ci));
        } else {
            setCart(cart.filter(ci => ci.cartItemKey !== cartItemKey));
        }
    };

    const getCartTotal = () => cart.reduce((total, item) => total + ((item.finalPrice || item.price) * item.quantity), 0);

    const placeOrder = async (paymentInfo, deliveryInfo) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        const newOrder = {
            id: Date.now(),
            items: [...cart],
            total: getCartTotal(),
            orderType,
            status: 'preparing',
            estimatedTime: orderType === 'delivery' ? '35-45 min' : '15-20 min',
            deliveryInfo: orderType === 'delivery' ? deliveryInfo : null,
            paymentInfo,
            timestamp: new Date().toISOString(),
            assignedDriver: null,
            isActive: false,
            sentToRestaurant: false,
            driverConfirmed: false,
            restaurantName: cart[0]?.restaurantName || 'Restaurant',
            posExternalId: null,
            posStatus: null,
            customerName: user.name,
            customerPhone: user.phone
        };

        // Add order to state first
        setOrders([newOrder, ...orders]);

        // Try to send to POS automatically if enabled
        const restaurant = restaurants.find(r => r.name === newOrder.restaurantName);
        if (restaurant?.posConfig?.enabled && restaurant.posConfig.settings?.autoSendOrders) {
            try {
                const result = await posManager.sendOrder(
                    restaurant.id,
                    restaurant.posConfig,
                    newOrder
                );

                if (result.success) {
                    // Update order with POS external ID
                    setOrders(prevOrders => prevOrders.map(o =>
                        o.id === newOrder.id
                            ? { ...o, posExternalId: result.externalId, posStatus: 'sent' }
                            : o
                    ));
                }
            } catch (error) {
                console.error('Failed to send order to POS:', error);
            }
        }

        setCart([]);
        setCurrentView('orders');
    };

    const sendToRestaurant = (orderId) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, sentToRestaurant: true } : o));
    };

    const sendToDriver = (orderId) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, isActive: true, status: 'out_for_delivery' } : o));
        setTimeout(() => {
            setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, driverConfirmed: true } : o));
        }, 4000);
    };

    const assignOrderToDriver = (orderId, driverId) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, assignedDriver: driverId, status: 'assigned', isActive: false, driverConfirmed: false } : o));
        setDrivers(drivers.map(d => d.id === driverId ? { ...d, status: 'busy', assignedOrders: [...d.assignedOrders, orderId] } : d));
    };

    const startDelivery = (orderId) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'in_transit', isActive: true } : o));
    };

    const stopDelivery = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        setOrders(orders.map(o => o.id === orderId ? { ...o, assignedDriver: null, status: 'preparing', isActive: false } : o));
        if (order.assignedDriver) {
            setDrivers(drivers.map(d => d.id === order.assignedDriver ? { ...d, status: d.assignedOrders.length === 1 ? 'available' : 'busy', assignedOrders: d.assignedOrders.filter(id => id !== orderId) } : d));
        }
    };

    const unassignOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.assignedDriver) return;

        setOrders(orders.map(o => o.id === orderId ? { ...o, assignedDriver: null, status: 'preparing', isActive: false, driverConfirmed: false } : o));

        setDrivers(drivers.map(d => d.id === order.assignedDriver ? {
            ...d,
            status: d.assignedOrders.length === 1 ? 'available' : 'busy',
            assignedOrders: d.assignedOrders.filter(id => id !== orderId)
        } : d));
    };

    const handleDragStart = (e, order) => setDraggedOrder(order);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, driver) => {
        e.preventDefault();
        if (draggedOrder && driver.status !== 'offline') {
            if (draggedOrder.assignedDriver) {
                unassignOrder(draggedOrder.id);
            }
            assignOrderToDriver(draggedOrder.id, driver.id);
            setDraggedOrder(null);
        }
    };

    const updateRestaurant = (restaurantId, updates) => {
        setRestaurants(restaurants.map(r => r.id === restaurantId ? { ...r, ...updates } : r));
    };

    const addMenuItem = (restaurantId, item) => {
        setRestaurants(restaurants.map(r => r.id === restaurantId ? { ...r, menu: [...r.menu, { ...item, id: Date.now(), options: [] }] } : r));
    };

    const updateMenuItem = (restaurantId, itemId, updates) => {
        setRestaurants(restaurants.map(r => r.id === restaurantId ? { ...r, menu: r.menu.map(i => i.id === itemId ? { ...i, ...updates } : i) } : r));
    };

    const deleteMenuItem = (restaurantId, itemId) => {
        setRestaurants(restaurants.map(r => r.id === restaurantId ? { ...r, menu: r.menu.filter(i => i.id !== itemId) } : r));
    };

    const addRestaurant = (restaurant) => {
        setRestaurants([...restaurants, { ...restaurant, id: Date.now(), menu: [], rating: 4.5, isActive: true }]);
    };

    const LoginModal = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [isSignUp, setIsSignUp] = useState(false);
        const [formData, setFormData] = useState({
            name: '', email: '', phone: '', address: '', city: '', state: '', zipcode: '', cardNumber: ''
        });

        const handleQuickLogin = () => {
            const isAdminLogin = email === 'admin@rdsware.com';
            const restaurantOwner = restaurants.find(r => email === `owner@${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);

            if (isSignUp) {
                setUser({
                    id: Date.now(),
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    addresses: [{ id: 1, label: 'Home', address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipcode}`, isDefault: true }],
                    paymentMethods: [{ id: 1, type: 'card', last4: formData.cardNumber.slice(-4), brand: 'visa', isDefault: true }]
                });
            } else {
                setUser({
                    id: 1,
                    name: isAdminLogin ? 'Admin' : restaurantOwner ? restaurantOwner.name + ' Owner' : 'John Doe',
                    email: email || 'user@example.com',
                    phone: '555-1234',
                    addresses: [{ id: 1, label: 'Home', address: '123 Main St, Athens, GA 30601', isDefault: true }],
                    paymentMethods: [{ id: 1, type: 'card', last4: '4242', brand: 'visa', isDefault: true }]
                });
            }
            setIsAdmin(isAdminLogin);
            setIsRestaurantOwner(!!restaurantOwner);
            setRestaurantOwnerId(restaurantOwner?.id || null);
            setCurrentView(isAdminLogin ? 'admin' : restaurantOwner ? 'restaurant-backend' : 'landing');
            setShowLoginModal(false);
        };

        if (isSignUp) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
                    <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Create Account</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    className="p-3 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    className="p-3 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP"
                                    value={formData.zipcode}
                                    onChange={(e) => setFormData({...formData, zipcode: e.target.value})}
                                    className="p-3 border rounded"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Card Number"
                                value={formData.cardNumber}
                                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded"
                            />
                        </div>
                        <button onClick={handleQuickLogin} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 mt-4 mb-3">
                            Create Account
                        </button>
                        <p className="text-center text-sm">
                            Have an account? <button onClick={() => setIsSignUp(false)} className="text-blue-500 hover:underline">Sign In</button>
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
                <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4">Sign in to continue</h2>
                    <p className="text-gray-600 mb-4">Please sign in to place your order</p>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded mb-3"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded mb-4"
                    />
                    <button onClick={handleQuickLogin} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 mb-3">
                        Sign In
                    </button>
                    <p className="text-center text-sm">
                        No account? <button onClick={() => setIsSignUp(true)} className="text-blue-500 hover:underline">Create Account</button>
                    </p>
                </div>
            </div>
        );
    };

    const ProfileModal = () => {
        const [formData, setFormData] = useState({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });

        const handleSave = () => {
            setUser({ ...user, ...formData });
            setShowProfileModal(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowProfileModal(false)}>
                <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full p-3 border rounded"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button onClick={handleSave} className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                            Save Changes
                        </button>
                        <button onClick={() => setShowProfileModal(false)} className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const AccountPage = () => {
        const [newAddress, setNewAddress] = useState('');
        const [showAddAddress, setShowAddAddress] = useState(false);

        const addAddress = () => {
            if (newAddress.trim()) {
                setUser({
                    ...user,
                    addresses: [...user.addresses, { id: Date.now(), label: 'Address', address: newAddress, isDefault: false }]
                });
                setNewAddress('');
                setShowAddAddress(false);
            }
        };

        const setDefaultAddress = (addressId) => {
            setUser({
                ...user,
                addresses: user.addresses.map(a => ({ ...a, isDefault: a.id === addressId }))
            });
        };

        const deleteAddress = (addressId) => {
            setUser({
                ...user,
                addresses: user.addresses.filter(a => a.id !== addressId)
            });
        };

        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Account</h1>
                    <button onClick={() => { setUser(null); setIsAdmin(false); setCurrentView('landing'); }} className="text-blue-500 hover:underline">
                        Sign Out
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Profile Information</h2>
                        <button onClick={() => setShowProfileModal(true)} className="text-blue-500 hover:underline">
                            Edit
                        </button>
                    </div>
                    <div className="space-y-2">
                        <p><span className="font-semibold">Name:</span> {user.name}</p>
                        <p><span className="font-semibold">Email:</span> {user.email}</p>
                        <p><span className="font-semibold">Phone:</span> {user.phone}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Saved Addresses</h2>
                        <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-blue-500 hover:underline">
                            Add Address
                        </button>
                    </div>
                    {showAddAddress && (
                        <div className="mb-4 p-4 bg-gray-50 rounded">
                            <input
                                type="text"
                                placeholder="Enter new address"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                className="w-full p-3 border rounded mb-2"
                            />
                            <div className="flex gap-2">
                                <button onClick={addAddress} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                    Save
                                </button>
                                <button onClick={() => { setShowAddAddress(false); setNewAddress(''); }} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-3">
                        {user.addresses.map(address => (
                            <div key={address.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-semibold">{address.label}</p>
                                    <p className="text-gray-600">{address.address}</p>
                                    {address.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">Default</span>}
                                </div>
                                <div className="flex gap-2">
                                    {!address.isDefault && (
                                        <button onClick={() => setDefaultAddress(address.id)} className="text-blue-500 text-sm hover:underline">
                                            Set Default
                                        </button>
                                    )}
                                    <button onClick={() => deleteAddress(address.id)} className="text-blue-500 text-sm hover:underline">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
                    <div className="space-y-3">
                        {user.paymentMethods.map(method => (
                            <div key={method.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-semibold capitalize">{method.brand} •••• {method.last4}</p>
                                    {method.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">Default</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Order History</h2>
                    {orders.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(order => (
                                <div key={order.id} className="p-4 bg-gray-50 rounded">
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <p className="font-semibold">Order #{order.id}</p>
                                            <p className="text-sm text-gray-600">{order.restaurantName}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${order.total.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600 capitalize">{order.status.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    function LoginScreen() {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [isSignUp, setIsSignUp] = useState(false);
        const [formData, setFormData] = useState({
            name: '', email: '', phone: '', address: '', city: '', state: '', zipcode: '', cardNumber: '', cardName: '', expiryDate: '', cvv: ''
        });

        const handleLogin = () => {
            const isAdminLogin = email === 'admin@rdsware.com';
            const restaurantOwner = restaurants.find(r => email === `owner@${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);

            if (isSignUp) {
                setUser({
                    id: Date.now(), name: formData.name, email: formData.email, phone: formData.phone,
                    addresses: [{ id: 1, label: 'Home', address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipcode}`, isDefault: true }],
                    paymentMethods: [{ id: 1, type: 'card', last4: formData.cardNumber.slice(-4), brand: 'visa', isDefault: true }]
                });
            } else {
                setUser({ id: 1, name: isAdminLogin ? 'Admin' : restaurantOwner ? restaurantOwner.name + ' Owner' : 'John Doe', email, phone: '555-1234', addresses: [{ id: 1, label: 'Home', address: '123 Main St', isDefault: true }], paymentMethods: [{ id: 1, type: 'card', last4: '4242', brand: 'visa', isDefault: true }] });
            }
            setIsAdmin(isAdminLogin);
            setIsRestaurantOwner(!!restaurantOwner);
            setRestaurantOwnerId(restaurantOwner?.id || null);
            setCurrentView(isAdminLogin ? 'admin' : restaurantOwner ? 'restaurant-backend' : 'landing');
        };

        if (isSignUp) {
            return (
                <div className="min-h-screen bg-gray-50 py-12 px-4">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded" />
                            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded" />
                            <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border rounded" />
                            <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded" />
                            <div className="grid grid-cols-3 gap-4">
                                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="p-3 border rounded" />
                                <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="p-3 border rounded" />
                                <input type="text" placeholder="ZIP" value={formData.zipcode} onChange={(e) => setFormData({...formData, zipcode: e.target.value})} className="p-3 border rounded" />
                            </div>
                            <input type="text" placeholder="Card Number" value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: e.target.value})} className="w-full p-3 border rounded" />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded" />
                            <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold">Create Account</button>
                        </div>
                        <p className="text-center mt-4">
                            Have an account? <button onClick={() => setIsSignUp(false)} className="text-blue-500 hover:underline">Sign In</button>
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded mb-4" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded mb-6" />
                    <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">Sign In</button>
                    <p className="text-center mt-4 text-sm text-gray-600">Demo Accounts:</p>
                    <p className="text-center text-xs text-gray-600">Admin: admin@rdsware.com</p>
                    <p className="text-center text-xs text-gray-600">Restaurant: owner@mariositalian.com</p>
                    <p className="text-center text-xs text-gray-600">Restaurant: owner@tokyosushi.com</p>
                    <p className="text-center text-xs text-gray-600">Restaurant: owner@burgerjunction.com</p>
                    <p className="text-center mt-4">
                        No account? <button onClick={() => setIsSignUp(true)} className="text-blue-500 hover:underline">Sign Up</button>
                    </p>
                </div>
            </div>
        );
    }

    const LandingPage = () => {
        const [addressInput, setAddressInput] = useState('');
        const landingPageContent = customPages.find(p => p.isLandingPage);

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-6xl font-bold text-center mb-4">Delicious food, <span className="text-blue-500">delivered fast</span></h1>
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mb-12">
                        <div className="flex gap-4">
                            <input type="text" placeholder="Enter address" value={addressInput} onChange={(e) => setAddressInput(e.target.value)} className="flex-1 p-4 border-2 rounded-lg text-lg" />
                            <button onClick={() => { setCustomerAddress(addressInput); setCurrentView('home'); }} className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 font-semibold">Find Food</button>
                        </div>
                    </div>

                    {/* Custom Landing Page Content */}
                    {landingPageContent && landingPageContent.isActive && (
                        <div className="max-w-4xl mx-auto mb-12 bg-white rounded-xl p-8 shadow-lg">
                            <div
                                className="prose max-w-none landing-page-content"
                                dangerouslySetInnerHTML={{ __html: landingPageContent.content }}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-8">
                        {restaurants.filter(r => r.isActive).map(r => (
                            <div key={r.id} className="bg-white rounded-xl p-6 shadow-lg text-center">
                                <div className="text-6xl mb-4">{r.image}</div>
                                <h3 className="text-xl font-bold">{r.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx>{`
                    .landing-page-content h1 {
                        font-size: 2em;
                        font-weight: bold;
                        margin: 0.67em 0;
                    }

                    .landing-page-content h2 {
                        font-size: 1.5em;
                        font-weight: bold;
                        margin: 0.75em 0;
                        color: #1f2937;
                    }

                    .landing-page-content p {
                        margin: 1em 0;
                        line-height: 1.6;
                        color: #4b5563;
                    }

                    .landing-page-content ul, .landing-page-content ol {
                        padding-left: 2em;
                        margin: 1em 0;
                    }

                    .landing-page-content li {
                        margin: 0.5em 0;
                        color: #4b5563;
                    }

                    .landing-page-content strong {
                        font-weight: 600;
                        color: #111827;
                    }
                `}</style>
            </div>
        );
    };

    const HomeView = () => (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Restaurants near you</h1>
            <div className="grid grid-cols-3 gap-6">
                {restaurants.filter(r => r.isActive).map(r => (
                    <div key={r.id} onClick={() => { setSelectedRestaurant(r); setCurrentView('menu'); }} className="bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer p-6">
                        <div className="text-6xl mb-4 text-center">{r.image}</div>
                        <h2 className="text-xl font-bold mb-2">{r.name}</h2>
                        <p className="text-gray-600">{r.cuisine}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const MenuView = ({ restaurant }) => {
        const categories = [...new Set(restaurant.menu.map(i => i.category))];
        const [customizeItem, setCustomizeItem] = useState(null);

        return (
            <div className="max-w-4xl mx-auto p-6">
                <button onClick={() => setCurrentView('home')} className="text-blue-500 mb-4">← Back</button>
                <h1 className="text-3xl font-bold mb-6">{restaurant.name}</h1>
                {categories.map(cat => (
                    <div key={cat} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">{cat}</h2>
                        {restaurant.menu.filter(i => i.category === cat).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium">{item.name}</h3>
                                        {item.options && item.options.length > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Customizable</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                    <p className="font-bold mt-2">${item.price}</p>
                                </div>
                                {item.options && item.options.length > 0 ? (
                                    <button onClick={() => setCustomizeItem({ item, restaurantId: restaurant.id })} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Customize</button>
                                ) : (
                                    cart.find(ci => ci.id === item.id && !ci.selectedOptions) ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => removeFromCart(`${item.id}_{}`)} className="w-8 h-8 bg-blue-500 text-white rounded-full"><Minus size={16} /></button>
                                            <span>{cart.find(ci => ci.id === item.id && !ci.selectedOptions)?.quantity}</span>
                                            <button onClick={() => addToCart(item, restaurant.id, {})} className="w-8 h-8 bg-blue-500 text-white rounded-full"><Plus size={16} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => addToCart(item, restaurant.id, {})} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add</button>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                {customizeItem && (
                    <CustomizeModal
                        item={customizeItem.item}
                        restaurantId={customizeItem.restaurantId}
                        onClose={() => setCustomizeItem(null)}
                        onAddToCart={(item, restaurantId, selectedOptions) => {
                            addToCart(item, restaurantId, selectedOptions);
                            setCustomizeItem(null);
                        }}
                    />
                )}
            </div>
        );
    };

    const CustomizeModal = ({ item, restaurantId, onClose, onAddToCart }) => {
        const [selectedOptions, setSelectedOptions] = useState({});
        const [quantity, setQuantity] = useState(1);

        const handleOptionChange = (optionId, choiceId, isMultiple) => {
            if (isMultiple) {
                const current = selectedOptions[optionId] || [];
                if (current.includes(choiceId)) {
                    setSelectedOptions({ ...selectedOptions, [optionId]: current.filter(id => id !== choiceId) });
                } else {
                    setSelectedOptions({ ...selectedOptions, [optionId]: [...current, choiceId] });
                }
            } else {
                setSelectedOptions({ ...selectedOptions, [optionId]: [choiceId] });
            }
        };

        const calculateTotalPrice = () => {
            let price = item.price;
            item.options?.forEach(option => {
                const selectedChoices = selectedOptions[option.id] || [];
                selectedChoices.forEach(choiceId => {
                    const choice = option.choices.find(c => c.id === choiceId);
                    if (choice) {
                        price += choice.priceModifier;
                    }
                });
            });
            return price * quantity;
        };

        const isValid = () => {
            return item.options?.every(option => {
                if (option.required) {
                    const selected = selectedOptions[option.id];
                    return selected && selected.length > 0;
                }
                return true;
            }) ?? true;
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">{item.name}</h2>
                            <p className="text-gray-600">{item.description}</p>
                            <p className="text-lg font-bold mt-2">Base Price: ${item.price.toFixed(2)}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {item.options?.map(option => (
                            <div key={option.id} className="border-b pb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="font-semibold text-lg">{option.name}</h3>
                                    {option.required && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Required</span>}
                                </div>
                                <div className="space-y-2">
                                    {option.choices.map(choice => (
                                        <label key={choice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type={option.type === 'single' ? 'radio' : 'checkbox'}
                                                    name={`option-${option.id}`}
                                                    checked={(selectedOptions[option.id] || []).includes(choice.id)}
                                                    onChange={() => handleOptionChange(option.id, choice.id, option.type === 'multiple')}
                                                    className="w-4 h-4"
                                                />
                                                <span>{choice.name}</span>
                                            </div>
                                            <span className={`font-semibold ${choice.priceModifier > 0 ? 'text-green-600' : choice.priceModifier < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                                {choice.priceModifier > 0 ? '+' : ''}{choice.priceModifier === 0 ? 'Free' : `$${choice.priceModifier.toFixed(2)}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold">Quantity:</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">
                                    <Minus size={16} className="mx-auto" />
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">
                                    <Plus size={16} className="mx-auto" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold mb-4">
                            <span>Total:</span>
                            <span>${calculateTotalPrice().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => {
                                for (let i = 0; i < quantity; i++) {
                                    onAddToCart(item, restaurantId, selectedOptions);
                                }
                            }}
                            disabled={!isValid()}
                            className={`w-full py-3 rounded-lg font-semibold ${isValid() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            {isValid() ? 'Add to Cart' : 'Please select required options'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const MenuItemOptionsModal = ({ item, restaurantId, onClose }) => {
        const [options, setOptions] = useState(item.options || []);
        const [editingOptionId, setEditingOptionId] = useState(null);
        const [newOption, setNewOption] = useState({ name: '', type: 'single', required: false, choices: [] });
        const [addingChoice, setAddingChoice] = useState(null);
        const [newChoice, setNewChoice] = useState({ name: '', priceModifier: 0 });

        const saveOptions = () => {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            const updatedMenu = restaurant.menu.map(menuItem =>
                menuItem.id === item.id ? { ...menuItem, options } : menuItem
            );
            setRestaurants(restaurants.map(r =>
                r.id === restaurantId ? { ...r, menu: updatedMenu } : r
            ));
            onClose();
        };

        const addOption = () => {
            if (!newOption.name.trim()) return;
            const newId = Math.max(0, ...options.map(o => o.id)) + 1;
            setOptions([...options, { ...newOption, id: newId, choices: [] }]);
            setNewOption({ name: '', type: 'single', required: false, choices: [] });
        };

        const updateOption = (optionId, updates) => {
            setOptions(options.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt));
        };

        const deleteOption = (optionId) => {
            if (window.confirm('Delete this option group?')) {
                setOptions(options.filter(opt => opt.id !== optionId));
            }
        };

        const addChoiceToOption = (optionId) => {
            if (!newChoice.name.trim()) return;
            const option = options.find(o => o.id === optionId);
            const newId = Math.max(0, ...option.choices.map(c => c.id), ...options.flatMap(o => o.choices.map(c => c.id))) + 1;
            const updatedChoices = [...option.choices, { ...newChoice, id: newId }];
            updateOption(optionId, { choices: updatedChoices });
            setNewChoice({ name: '', priceModifier: 0 });
            setAddingChoice(null);
        };

        const updateChoice = (optionId, choiceId, updates) => {
            const option = options.find(o => o.id === optionId);
            const updatedChoices = option.choices.map(c => c.id === choiceId ? { ...c, ...updates } : c);
            updateOption(optionId, { choices: updatedChoices });
        };

        const deleteChoice = (optionId, choiceId) => {
            if (window.confirm('Delete this choice?')) {
                const option = options.find(o => o.id === optionId);
                const updatedChoices = option.choices.filter(c => c.id !== choiceId);
                updateOption(optionId, { choices: updatedChoices });
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Manage Options for {item.name}</h2>
                            <p className="text-gray-600">Add and configure customization options like size, toppings, etc.</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Existing Options */}
                    <div className="space-y-4 mb-6">
                        {options.map(option => (
                            <div key={option.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{option.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded ${option.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {option.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                                        </span>
                                        {option.required && (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingOptionId(editingOptionId === option.id ? null : option.id)}
                                            className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                                        >
                                            {editingOptionId === option.id ? 'Done' : 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => deleteOption(option.id)}
                                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {editingOptionId === option.id && (
                                    <div className="mb-3 p-3 bg-white rounded border">
                                        <div className="grid grid-cols-3 gap-3 mb-2">
                                            <input
                                                type="text"
                                                value={option.name}
                                                onChange={(e) => updateOption(option.id, { name: e.target.value })}
                                                className="border rounded px-3 py-2"
                                                placeholder="Option name"
                                            />
                                            <select
                                                value={option.type}
                                                onChange={(e) => updateOption(option.id, { type: e.target.value })}
                                                className="border rounded px-3 py-2"
                                            >
                                                <option value="single">Single Choice</option>
                                                <option value="multiple">Multiple Choice</option>
                                            </select>
                                            <label className="flex items-center gap-2 px-3">
                                                <input
                                                    type="checkbox"
                                                    checked={option.required}
                                                    onChange={(e) => updateOption(option.id, { required: e.target.checked })}
                                                />
                                                <span>Required</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Choices */}
                                <div className="space-y-2">
                                    {option.choices.map(choice => (
                                        <div key={choice.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span>{choice.name}</span>
                                                <span className={`text-sm font-semibold ${choice.priceModifier > 0 ? 'text-green-600' : choice.priceModifier < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {choice.priceModifier > 0 ? '+' : ''}{choice.priceModifier === 0 ? 'No charge' : `$${choice.priceModifier.toFixed(2)}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={choice.name}
                                                    onChange={(e) => updateChoice(option.id, choice.id, { name: e.target.value })}
                                                    className="border rounded px-2 py-1 text-sm w-32"
                                                    placeholder="Choice name"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={choice.priceModifier}
                                                    onChange={(e) => updateChoice(option.id, choice.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                                                    className="border rounded px-2 py-1 text-sm w-20"
                                                    placeholder="Price"
                                                />
                                                <button
                                                    onClick={() => deleteChoice(option.id, choice.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Choice */}
                                    {addingChoice === option.id ? (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                                            <input
                                                type="text"
                                                value={newChoice.name}
                                                onChange={(e) => setNewChoice({ ...newChoice, name: e.target.value })}
                                                className="border rounded px-2 py-1 text-sm flex-1"
                                                placeholder="Choice name (e.g., Large, Extra Cheese)"
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newChoice.priceModifier}
                                                onChange={(e) => setNewChoice({ ...newChoice, priceModifier: parseFloat(e.target.value) || 0 })}
                                                className="border rounded px-2 py-1 text-sm w-24"
                                                placeholder="Price"
                                            />
                                            <button
                                                onClick={() => addChoiceToOption(option.id)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddingChoice(null);
                                                    setNewChoice({ name: '', priceModifier: 0 });
                                                }}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddingChoice(option.id)}
                                            className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                                        >
                                            + Add Choice
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Option */}
                    <div className="border-t pt-4 mb-4">
                        <h3 className="font-semibold mb-3">Add New Option Group</h3>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <input
                                type="text"
                                value={newOption.name}
                                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                                className="border rounded px-3 py-2"
                                placeholder="Option name (e.g., Size, Toppings)"
                            />
                            <select
                                value={newOption.type}
                                onChange={(e) => setNewOption({ ...newOption, type: e.target.value })}
                                className="border rounded px-3 py-2"
                            >
                                <option value="single">Single Choice</option>
                                <option value="multiple">Multiple Choice</option>
                            </select>
                            <label className="flex items-center gap-2 px-3">
                                <input
                                    type="checkbox"
                                    checked={newOption.required}
                                    onChange={(e) => setNewOption({ ...newOption, required: e.target.checked })}
                                />
                                <span>Required</span>
                            </label>
                        </div>
                        <button
                            onClick={addOption}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Add Option Group
                        </button>
                    </div>

                    {/* Save Button */}
                    <div className="border-t pt-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveOptions}
                            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Save Options
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const CheckoutView = () => {
        const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', name: user?.name || '' });
        const [deliveryInfo, setDeliveryInfo] = useState({ address: customerAddress || user?.addresses?.[0]?.address || '', phone: user?.phone || '' });
        const [couponCode, setCouponCode] = useState('');
        const [giftCertCode, setGiftCertCode] = useState('');
        const [couponError, setCouponError] = useState('');
        const [giftCertError, setGiftCertError] = useState('');

        const applyCoupon = () => {
            const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);
            if (!coupon) {
                setCouponError('Invalid or inactive coupon code');
                return;
            }
            const subtotal = getCartTotal();
            if (subtotal < coupon.minOrderAmount) {
                setCouponError(`Minimum order amount is $${coupon.minOrderAmount.toFixed(2)}`);
                return;
            }
            setAppliedCoupon(coupon);
            setCouponError('');
            setCouponCode('');
            setCoupons(coupons.map(c => c.id === coupon.id ? {...c, usageCount: c.usageCount + 1} : c));
        };

        const applyGiftCert = () => {
            const cert = giftCertificates.find(c => c.code === giftCertCode.toUpperCase() && c.isActive && c.balance > 0);
            if (!cert) {
                setGiftCertError('Invalid or inactive gift certificate');
                return;
            }
            setAppliedGiftCert(cert);
            setGiftCertError('');
            setGiftCertCode('');
        };

        const subtotal = getCartTotal();
        const deliveryFee = orderType === 'delivery' ? 2.99 : 0;
        const couponDiscount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercent / 100)) : 0;
        const afterCoupon = subtotal - couponDiscount;
        const giftCertApplied = appliedGiftCert ? Math.min(appliedGiftCert.balance, afterCoupon + deliveryFee) : 0;
        const total = afterCoupon + deliveryFee - giftCertApplied;

        return (
            <div className="max-w-2xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6">Checkout</h2>
                <div className="mb-6">
                    <button onClick={() => setOrderType('delivery')} className={`px-4 py-2 rounded-lg mr-2 ${orderType === 'delivery' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Delivery</button>
                    <button onClick={() => setOrderType('pickup')} className={`px-4 py-2 rounded-lg ${orderType === 'pickup' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Pickup</button>
                </div>
                {orderType === 'delivery' && (
                    <div className="mb-6">
                        <input type="text" placeholder="Address" value={deliveryInfo.address} onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})} className="w-full p-3 border rounded mb-3" />
                        <input type="tel" placeholder="Phone" value={deliveryInfo.phone} onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})} className="w-full p-3 border rounded" />
                    </div>
                )}

                {/* Coupon Code Section */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Have a coupon code?</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 p-3 border rounded"
                            disabled={!!appliedCoupon}
                        />
                        <button
                            onClick={applyCoupon}
                            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                            disabled={!!appliedCoupon}
                        >
                            Apply
                        </button>
                    </div>
                    {couponError && <p className="text-blue-500 text-sm mt-1">{couponError}</p>}
                    {appliedCoupon && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                            <span className="text-green-800 text-sm">Coupon "{appliedCoupon.code}" applied - {appliedCoupon.discountPercent}% off!</span>
                            <button onClick={() => setAppliedCoupon(null)} className="text-blue-500 text-sm hover:underline">Remove</button>
                        </div>
                    )}
                </div>

                {/* Gift Certificate Section */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Have a gift certificate?</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter gift certificate code"
                            value={giftCertCode}
                            onChange={(e) => setGiftCertCode(e.target.value)}
                            className="flex-1 p-3 border rounded"
                            disabled={!!appliedGiftCert}
                        />
                        <button
                            onClick={applyGiftCert}
                            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                            disabled={!!appliedGiftCert}
                        >
                            Apply
                        </button>
                    </div>
                    {giftCertError && <p className="text-blue-500 text-sm mt-1">{giftCertError}</p>}
                    {appliedGiftCert && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                            <span className="text-green-800 text-sm">Gift certificate "{appliedGiftCert.code}" applied - ${giftCertApplied.toFixed(2)}</span>
                            <button onClick={() => setAppliedGiftCert(null)} className="text-blue-500 text-sm hover:underline">Remove</button>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <input type="text" placeholder="Card Number" value={paymentInfo.cardNumber} onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})} className="w-full p-3 border rounded mb-3" />
                    <input type="text" placeholder="Name" value={paymentInfo.name} onChange={(e) => setPaymentInfo({...paymentInfo, name: e.target.value})} className="w-full p-3 border rounded" />
                </div>
                <div className="bg-gray-50 p-4 rounded mb-6">
                    {cart.map(item => {
                        const itemRestaurant = restaurants.find(r => r.id === item.restaurantId);
                        const menuItem = itemRestaurant?.menu.find(mi => mi.id === item.id);

                        return (
                            <div key={item.cartItemKey} className="mb-3 pb-3 border-b last:border-0">
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold">{item.quantity}x {item.name}</span>
                                    <span className="font-semibold">${((item.finalPrice || item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                    <div className="ml-4 mt-1 text-sm text-gray-600">
                                        {menuItem?.options?.map(option => {
                                            const selectedChoiceIds = item.selectedOptions[option.id] || [];
                                            if (selectedChoiceIds.length === 0) return null;

                                            const selectedChoices = selectedChoiceIds.map(choiceId =>
                                                option.choices.find(c => c.id === choiceId)
                                            ).filter(Boolean);

                                            return (
                                                <div key={option.id}>
                                                    <span className="font-medium">{option.name}:</span> {selectedChoices.map(c => c.name).join(', ')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between mb-1">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {deliveryFee > 0 && (
                            <div className="flex justify-between mb-1">
                                <span>Delivery Fee</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        {appliedCoupon && (
                            <div className="flex justify-between mb-1 text-green-600">
                                <span>Coupon Discount ({appliedCoupon.discountPercent}%)</span>
                                <span>-${couponDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        {appliedGiftCert && (
                            <div className="flex justify-between mb-1 text-green-600">
                                <span>Gift Certificate</span>
                                <span>-${giftCertApplied.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => {
                    if (appliedGiftCert && giftCertApplied > 0) {
                        setGiftCertificates(giftCertificates.map(c =>
                            c.id === appliedGiftCert.id ? {...c, balance: c.balance - giftCertApplied} : c
                        ));
                    }
                    placeOrder(paymentInfo, deliveryInfo);
                    setAppliedCoupon(null);
                    setAppliedGiftCert(null);
                }} className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 font-semibold">
                    Place Order - ${total.toFixed(2)}
                </button>
            </div>
        );
    };

    const OrdersView = () => (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
            {orders.length === 0 ? <p className="text-gray-500 text-center py-8">No orders yet</p> : orders.map(o => (
                <div key={o.id} className="bg-white border rounded-lg p-6 mb-4">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold">Order #{o.id}</h3>
                            <p className="text-gray-600">{o.restaurantName}</p>
                        </div>
                        <div className="text-right">
                            <span className="font-bold">${o.total.toFixed(2)}</span>
                            <p className="text-sm text-gray-500">{o.status}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const DispatchView = () => {
        const unassignedOrders = orders.filter(o => !o.assignedDriver && o.orderType === 'delivery');
        return (
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Dispatch</h1>
                {selectedOrderDetail && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedOrderDetail(null)}>
                        <div className="bg-white rounded-lg p-6 max-w-2xl" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold mb-4">Order #{selectedOrderDetail.id}</h2>
                            <p className="mb-4">{selectedOrderDetail.restaurantName}</p>
                            {selectedOrderDetail.items.map((item, i) => (
                                <div key={i} className="flex justify-between mb-2">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <button onClick={() => setSelectedOrderDetail(null)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Close</button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-4 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Queue ({unassignedOrders.length})</h2>
                        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {unassignedOrders.map(o => (
                                <div key={o.id} draggable={o.sentToRestaurant} onDragStart={(e) => o.sentToRestaurant && handleDragStart(e, o)} onDoubleClick={() => setSelectedOrderDetail(o)} className={`bg-gray-50 p-3 rounded border-2 border-dashed ${o.sentToRestaurant ? 'cursor-grab hover:border-blue-300' : 'border-gray-300'} mb-3`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">Order #{o.id}</p>
                                            <p className="text-xs text-blue-600 font-medium">{o.restaurantName}</p>
                                            <p className="text-xs text-gray-600 mt-1">{o.items.length} items</p>
                                            {o.posExternalId && (
                                                <p className="text-xs text-purple-600 font-medium mt-1">
                                                    POS: {o.posExternalId.substring(0, 8)}...
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-bold text-sm">${o.total.toFixed(2)}</span>
                                            {o.posStatus && (
                                                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                                                    {o.posStatus}
                                                </span>
                                            )}
                                            {!o.sentToRestaurant ? (
                                                <button
                                                    onClick={() => sendToRestaurant(o.id)}
                                                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center gap-1"
                                                    title="Send to restaurant"
                                                >
                                                    <Send size={14} />
                                                </button>
                                            ) : (
                                                <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                                    <Check size={14} />
                                                    Sent
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {o.sentToRestaurant && (
                                        <p className="text-xs text-gray-500 mt-2">Drag to assign driver →</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-8 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Drivers ({drivers.length})</h2>
                        <div className="grid grid-cols-3 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {drivers.map(d => {
                                const driverOrders = orders.filter(o => o.assignedDriver === d.id);
                                return (
                                    <div key={d.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, d)} className={`p-3 rounded border-2 ${d.status === 'available' ? 'bg-green-50 border-green-200' : d.status === 'busy' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} ${draggedOrder && d.status !== 'offline' ? 'border-dashed border-blue-400' : ''}`}>
                                        <div className="text-xl mb-2">{d.avatar}</div>
                                        <p className="font-semibold text-sm">{d.name}</p>
                                        <p className="text-xs text-gray-600 mb-2">{d.vehicle}</p>
                                        <div className={`px-2 py-1 rounded-full text-xs mb-2 inline-block ${d.status === 'available' ? 'bg-green-100 text-green-800' : d.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {d.status.toUpperCase()}
                                        </div>
                                        {driverOrders.length > 0 && (
                                            <div className="mt-3 pt-3 border-t space-y-2">
                                                {driverOrders.map(o => (
                                                    <div
                                                        key={o.id}
                                                        draggable={!o.isActive && !o.driverConfirmed}
                                                        onDragStart={(e) => (!o.isActive && !o.driverConfirmed) && handleDragStart(e, o)}
                                                        onDoubleClick={() => setSelectedOrderDetail(o)}
                                                        className={`p-2 rounded border ${o.driverConfirmed ? 'bg-green-50 border-green-300' : o.isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 cursor-grab hover:border-blue-300'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold">Order #{o.id}</p>
                                                                <p className="text-xs text-blue-600">{o.restaurantName}</p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-bold">${o.total.toFixed(2)}</span>
                                                                    <button
                                                                        onClick={() => unassignOrder(o.id)}
                                                                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                                                                        title="Unassign order"
                                                                    >
                                                                        <X size={10} />
                                                                    </button>
                                                                </div>
                                                                {!o.isActive && !o.driverConfirmed && (
                                                                    <button
                                                                        onClick={() => sendToDriver(o.id)}
                                                                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                                                                        title="Send to driver"
                                                                    >
                                                                        <Play size={12} />
                                                                    </button>
                                                                )}
                                                                {o.isActive && !o.driverConfirmed && (
                                                                    <div className="bg-blue-500 text-white p-1 rounded">
                                                                        <Clock size={12} />
                                                                    </div>
                                                                )}
                                                                {o.driverConfirmed && (
                                                                    <div className="bg-green-500 text-white p-1 rounded">
                                                                        <Check size={12} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <div className={`w-2 h-2 rounded-full ${o.driverConfirmed ? 'bg-green-500' : o.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                                                <span className="text-gray-600">
                                  {o.driverConfirmed ? 'Confirmed' : o.isActive ? 'Waiting...' : 'Assigned'}
                                </span>
                                                            </div>
                                                            {!o.isActive && !o.driverConfirmed && (
                                                                <span className="text-xs text-gray-400">Drag to reassign</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Workflow:</strong> 1) Click <Send size={12} className="inline" /> to send order to restaurant → 2) Drag to driver → 3) Click <Play size={12} className="inline" /> to send to driver → 4) Wait for <Check size={12} className="inline" /> confirmation
                    </p>
                    <p className="text-sm text-blue-800 mt-2">
                        <strong>Reassign:</strong> Click <X size={12} className="inline" /> to unassign and return to queue, or drag assigned orders to another driver to reassign
                    </p>
                </div>
            </div>
        );
    };

    const AdminView = () => {
        const [activeTab, setActiveTab] = useState('restaurants');
        const [showAdd, setShowAdd] = useState(false);
        const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', image: '', deliveryFee: 2.99, deliveryTime: '30-40 min', address: '', phone: '', commissionRate: 0.15, deliveryRadius: 10, minOrderAmount: 10.00 });
        const [newItem, setNewItem] = useState({ name: '', price: '', category: '', description: '' });
        return (
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Admin</h1>
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setActiveTab('restaurants')} className={`px-4 py-2 rounded ${activeTab === 'restaurants' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Restaurants</button>
                    <button onClick={() => setActiveTab('finances')} className={`px-4 py-2 rounded ${activeTab === 'finances' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Finances</button>
                    <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2 rounded ${activeTab === 'marketing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Marketing</button>
                    <button onClick={() => setActiveTab('pages')} className={`px-4 py-2 rounded ${activeTab === 'pages' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Pages</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Settings</button>
                </div>
                {activeTab === 'restaurants' && (
                    <div>
                        <button onClick={() => setShowAdd(!showAdd)} className="bg-green-500 text-white px-4 py-2 rounded mb-4">Add Restaurant</button>
                        {showAdd && (
                            <div className="bg-white p-6 rounded shadow mb-6">
                                <h3 className="text-xl font-bold mb-4">New Restaurant</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Restaurant Name" value={newRestaurant.name} onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})} className="p-3 border rounded" />
                                    <input type="text" placeholder="Cuisine Type" value={newRestaurant.cuisine} onChange={(e) => setNewRestaurant({...newRestaurant, cuisine: e.target.value})} className="p-3 border rounded" />
                                    <input type="text" placeholder="Emoji Icon" value={newRestaurant.image} onChange={(e) => setNewRestaurant({...newRestaurant, image: e.target.value})} className="p-3 border rounded" />
                                    <input type="text" placeholder="Delivery Time (e.g. 25-35 min)" value={newRestaurant.deliveryTime} onChange={(e) => setNewRestaurant({...newRestaurant, deliveryTime: e.target.value})} className="p-3 border rounded" />
                                    <input type="text" placeholder="Address" value={newRestaurant.address} onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})} className="p-3 border rounded col-span-2" />
                                    <input type="tel" placeholder="Phone Number" value={newRestaurant.phone} onChange={(e) => setNewRestaurant({...newRestaurant, phone: e.target.value})} className="p-3 border rounded" />
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Delivery Fee ($)</label>
                                        <input type="number" placeholder="2.99" value={newRestaurant.deliveryFee} onChange={(e) => setNewRestaurant({...newRestaurant, deliveryFee: parseFloat(e.target.value)})} className="p-3 border rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Commission Rate (%)</label>
                                        <input type="number" placeholder="15" value={newRestaurant.commissionRate * 100} onChange={(e) => setNewRestaurant({...newRestaurant, commissionRate: parseFloat(e.target.value) / 100})} className="p-3 border rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Delivery Radius (miles)</label>
                                        <input type="number" placeholder="10" value={newRestaurant.deliveryRadius} onChange={(e) => setNewRestaurant({...newRestaurant, deliveryRadius: parseInt(e.target.value)})} className="p-3 border rounded w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Minimum Order ($)</label>
                                        <input type="number" placeholder="10.00" value={newRestaurant.minOrderAmount} onChange={(e) => setNewRestaurant({...newRestaurant, minOrderAmount: parseFloat(e.target.value)})} className="p-3 border rounded w-full" />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => { addRestaurant(newRestaurant); setShowAdd(false); setNewRestaurant({ name: '', cuisine: '', image: '', deliveryFee: 2.99, deliveryTime: '30-40 min', address: '', phone: '', commissionRate: 0.15, deliveryRadius: 10, minOrderAmount: 10.00 }); }} className="bg-green-500 text-white px-4 py-2 rounded">Save Restaurant</button>
                                    <button onClick={() => setShowAdd(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                </div>
                            </div>
                        )}
                        {restaurants.map(r => (
                            <div key={r.id} className="bg-white p-6 rounded shadow mb-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl">{r.image}</div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{r.name}</h3>
                                        <p className="text-gray-600">{r.cuisine}</p>
                                        <p className="text-sm text-gray-500">{r.address}</p>
                                        <p className="text-sm text-gray-500">{r.phone}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded text-sm ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {r.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                    <button onClick={() => setEditingRestaurant(editingRestaurant === r.id ? null : r.id)} className="bg-blue-500 text-white px-3 py-2 rounded text-sm">
                                        {editingRestaurant === r.id ? 'Close Settings' : 'Edit Settings'}
                                    </button>
                                    <button onClick={() => updateRestaurant(r.id, { isActive: !r.isActive })} className={`px-3 py-2 rounded text-sm ${r.isActive ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                                        {r.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                                {editingRestaurant === r.id && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-bold mb-3">Restaurant Settings</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 rounded">
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Restaurant Name</label>
                                                <input type="text" value={r.name} onChange={(e) => updateRestaurant(r.id, { name: e.target.value })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Cuisine Type</label>
                                                <input type="text" value={r.cuisine} onChange={(e) => updateRestaurant(r.id, { cuisine: e.target.value })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Icon/Emoji</label>
                                                <input type="text" value={r.image} onChange={(e) => updateRestaurant(r.id, { image: e.target.value })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Delivery Time</label>
                                                <input type="text" value={r.deliveryTime} onChange={(e) => updateRestaurant(r.id, { deliveryTime: e.target.value })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-semibold mb-1">Address</label>
                                                <input type="text" value={r.address || ''} onChange={(e) => updateRestaurant(r.id, { address: e.target.value })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Phone Number</label>
                                                <input type="tel" value={r.phone || ''} onChange={(e) => updateRestaurant(r.id, { phone: e.target.value })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Delivery Fee ($)</label>
                                                <input type="number" value={r.deliveryFee} onChange={(e) => updateRestaurant(r.id, { deliveryFee: parseFloat(e.target.value) })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Commission Rate (%)</label>
                                                <input type="number" value={r.commissionRate * 100} onChange={(e) => updateRestaurant(r.id, { commissionRate: parseFloat(e.target.value) / 100 })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Delivery Radius (miles)</label>
                                                <input type="number" value={r.deliveryRadius} onChange={(e) => updateRestaurant(r.id, { deliveryRadius: parseInt(e.target.value) })} className="p-2 border rounded w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold mb-1">Minimum Order ($)</label>
                                                <input type="number" value={r.minOrderAmount} onChange={(e) => updateRestaurant(r.id, { minOrderAmount: parseFloat(e.target.value) })} className="p-2 border rounded w-full" />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 mb-4">
                                            ✓ Changes saved automatically
                                        </div>

                                        <h4 className="font-bold mb-3">Menu Management</h4>
                                        <button onClick={() => setEditingMenuItem(r.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-3">Add Menu Item</button>
                                        {editingMenuItem === r.id && (
                                            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded">
                                                <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="p-2 border rounded" />
                                                <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} className="p-2 border rounded" />
                                                <input type="text" placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="p-2 border rounded" />
                                                <input type="text" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="p-2 border rounded" />
                                                <button onClick={() => { addMenuItem(r.id, {...newItem, price: parseFloat(newItem.price)}); setEditingMenuItem(null); setNewItem({name: '', price: '', category: '', description: ''}); }} className="bg-green-500 text-white px-3 py-1 rounded col-span-2">Save Item</button>
                                            </div>
                                        )}
                                        {r.menu.map(item => (
                                            <div key={item.id} className="p-3 bg-gray-50 rounded mb-2">
                                                {editingMenuItemId === item.id ? (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            value={newItem.name || item.name}
                                                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                                            placeholder="Item Name"
                                                            className="p-2 border rounded"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={newItem.price !== '' ? newItem.price : item.price}
                                                            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                                            placeholder="Price"
                                                            className="p-2 border rounded"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={newItem.category || item.category}
                                                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                                            placeholder="Category"
                                                            className="p-2 border rounded"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={newItem.description || item.description}
                                                            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                                            placeholder="Description"
                                                            className="p-2 border rounded"
                                                        />
                                                        <div className="col-span-2 flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    updateMenuItem(r.id, item.id, {
                                                                        name: newItem.name || item.name,
                                                                        price: newItem.price !== '' ? parseFloat(newItem.price) : item.price,
                                                                        category: newItem.category || item.category,
                                                                        description: newItem.description || item.description
                                                                    });
                                                                    setEditingMenuItemId(null);
                                                                    setNewItem({name: '', price: '', category: '', description: ''});
                                                                }}
                                                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingMenuItemId(null);
                                                                    setNewItem({name: '', price: '', category: '', description: ''});
                                                                }}
                                                                className="bg-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <div>
                                                                <p className="font-semibold">{item.name}</p>
                                                                <p className="text-sm text-gray-600">{item.category} • {item.description}</p>
                                                                {item.options && item.options.length > 0 && (
                                                                    <p className="text-xs text-blue-600 mt-1">{item.options.length} customization option(s)</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold">${item.price.toFixed(2)}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingMenuItemId(item.id);
                                                                        setNewItem({
                                                                            name: item.name,
                                                                            price: item.price,
                                                                            category: item.category,
                                                                            description: item.description
                                                                        });
                                                                    }}
                                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedItemForOptions({restaurantId: r.id, item})}
                                                                    className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                                                                >
                                                                    Options
                                                                </button>
                                                                <button onClick={() => deleteMenuItem(r.id, item.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'finances' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Financial Overview</h2>

                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-gray-600 mb-2">Total Revenue</h3>
                                <p className="text-3xl font-bold text-green-600">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-2">From {orders.length} orders</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-gray-600 mb-2">Platform Commission</h3>
                                <p className="text-3xl font-bold text-blue-600">
                                    ${orders.reduce((sum, o) => {
                                    const orderRestaurant = restaurants.find(r => r.name === o.restaurantName);
                                    return sum + (o.total * (orderRestaurant?.commissionRate || platformSettings.commissionRate));
                                }, 0).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Commission earnings</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-gray-600 mb-2">Restaurant Earnings</h3>
                                <p className="text-3xl font-bold text-purple-600">
                                    ${orders.reduce((sum, o) => {
                                    const orderRestaurant = restaurants.find(r => r.name === o.restaurantName);
                                    const commission = o.total * (orderRestaurant?.commissionRate || platformSettings.commissionRate);
                                    return sum + (o.total - commission);
                                }, 0).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">After commission</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-bold mb-4">Revenue by Restaurant</h3>
                            <div className="space-y-3">
                                {restaurants.map(restaurant => {
                                    const restaurantOrders = orders.filter(o => o.restaurantName === restaurant.name);
                                    const restaurantRevenue = restaurantOrders.reduce((sum, o) => sum + o.total, 0);
                                    const commission = restaurantRevenue * restaurant.commissionRate;

                                    return (
                                        <div key={restaurant.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{restaurant.image}</div>
                                                <div>
                                                    <h4 className="font-semibold">{restaurant.name}</h4>
                                                    <p className="text-sm text-gray-600">{restaurantOrders.length} orders</p>
                                                    <p className="text-xs text-gray-500">Commission: {(restaurant.commissionRate * 100).toFixed(0)}%</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">${restaurantRevenue.toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">Commission: ${commission.toFixed(2)}</p>
                                                <p className="text-sm text-green-600 font-semibold">Net: ${(restaurantRevenue - commission).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-bold mb-4">Order Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Orders</span>
                                        <span className="font-bold">{orders.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Orders</span>
                                        <span className="font-bold">{orders.filter(o => o.orderType === 'delivery').length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pickup Orders</span>
                                        <span className="font-bold">{orders.filter(o => o.orderType === 'pickup').length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average Order Value</span>
                                        <span className="font-bold">
                      ${orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2) : '0.00'}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-bold mb-4">Top Selling Items</h3>
                                <div className="space-y-2">
                                    {(() => {
                                        const itemCounts = {};
                                        orders.forEach(order => {
                                            order.items.forEach(item => {
                                                if (!itemCounts[item.name]) {
                                                    itemCounts[item.name] = { count: 0, revenue: 0 };
                                                }
                                                itemCounts[item.name].count += item.quantity;
                                                itemCounts[item.name].revenue += item.price * item.quantity;
                                            });
                                        });
                                        return Object.entries(itemCounts)
                                            .sort((a, b) => b[1].count - a[1].count)
                                            .slice(0, 5)
                                            .map(([name, data]) => (
                                                <div key={name} className="flex justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm">{name}</span>
                                                    <div className="text-sm">
                                                        <span className="font-semibold">{data.count} sold</span>
                                                        <span className="text-gray-600 ml-2">${data.revenue.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'marketing' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Marketing</h2>

                        {/* Coupon Codes Section */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Coupon Codes</h3>
                                <button onClick={() => {
                                    const code = prompt('Enter coupon code:');
                                    const discount = parseFloat(prompt('Enter discount percentage (e.g., 10 for 10%):'));
                                    const minOrder = parseFloat(prompt('Enter minimum order amount:') || '0');
                                    if (code && discount) {
                                        setCoupons([...coupons, {
                                            id: Date.now(),
                                            code: code.toUpperCase(),
                                            discountPercent: discount,
                                            minOrderAmount: minOrder,
                                            isActive: true,
                                            usageCount: 0
                                        }]);
                                    }
                                }} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                    Add Coupon
                                </button>
                            </div>
                            <div className="space-y-3">
                                {coupons.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No coupons created yet</p>
                                ) : (
                                    coupons.map(coupon => (
                                        <div key={coupon.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-bold text-lg">{coupon.code}</p>
                                                <p className="text-sm text-gray-600">{coupon.discountPercent}% off • Min order: ${coupon.minOrderAmount.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500 mt-1">Used {coupon.usageCount} times</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded text-sm ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <button
                                                    onClick={() => setCoupons(coupons.map(c => c.id === coupon.id ? {...c, isActive: !c.isActive} : c))}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                >
                                                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => setCoupons(coupons.filter(c => c.id !== coupon.id))}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Discounts Section */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Discounts</h3>
                                <button onClick={() => {
                                    const name = prompt('Enter discount name:');
                                    const type = prompt('Enter "sitewide" or restaurant ID:');
                                    const discountPercent = parseFloat(prompt('Enter discount percentage:'));
                                    if (name && discountPercent) {
                                        setDiscounts([...discounts, {
                                            id: Date.now(),
                                            name,
                                            type: type === 'sitewide' ? 'sitewide' : 'restaurant',
                                            restaurantId: type === 'sitewide' ? null : parseInt(type),
                                            discountPercent,
                                            isActive: true
                                        }]);
                                    }
                                }} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                    Add Discount
                                </button>
                            </div>
                            <div className="space-y-3">
                                {discounts.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No discounts created yet</p>
                                ) : (
                                    discounts.map(discount => {
                                        const restaurant = discount.restaurantId ? restaurants.find(r => r.id === discount.restaurantId) : null;
                                        return (
                                            <div key={discount.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                                <div>
                                                    <p className="font-bold text-lg">{discount.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {discount.type === 'sitewide' ? 'Site-wide' : `Restaurant: ${restaurant?.name || 'Unknown'}`} • {discount.discountPercent}% off
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded text-sm ${discount.isActive ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {discount.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <button
                                                        onClick={() => setDiscounts(discounts.map(d => d.id === discount.id ? {...d, isActive: !d.isActive} : d))}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                    >
                                                        {discount.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => setDiscounts(discounts.filter(d => d.id !== discount.id))}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Gift Certificates Section */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Gift Certificates</h3>
                                <button onClick={() => {
                                    const code = prompt('Enter gift certificate code:');
                                    const amount = parseFloat(prompt('Enter gift certificate amount:'));
                                    const recipientEmail = prompt('Enter recipient email (optional):') || '';
                                    if (code && amount) {
                                        setGiftCertificates([...giftCertificates, {
                                            id: Date.now(),
                                            code: code.toUpperCase(),
                                            amount,
                                            balance: amount,
                                            recipientEmail,
                                            isActive: true,
                                            createdAt: new Date().toISOString()
                                        }]);
                                    }
                                }} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                    Create Gift Certificate
                                </button>
                            </div>
                            <div className="space-y-3">
                                {giftCertificates.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No gift certificates created yet</p>
                                ) : (
                                    giftCertificates.map(cert => (
                                        <div key={cert.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-bold text-lg">{cert.code}</p>
                                                <p className="text-sm text-gray-600">Balance: ${cert.balance.toFixed(2)} / ${cert.amount.toFixed(2)}</p>
                                                {cert.recipientEmail && <p className="text-xs text-gray-500 mt-1">Recipient: {cert.recipientEmail}</p>}
                                                <p className="text-xs text-gray-400">Created: {new Date(cert.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded text-sm ${cert.isActive && cert.balance > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {cert.balance === 0 ? 'Depleted' : cert.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <button
                                                    onClick={() => setGiftCertificates(giftCertificates.map(c => c.id === cert.id ? {...c, isActive: !c.isActive} : c))}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                    disabled={cert.balance === 0}
                                                >
                                                    {cert.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => setGiftCertificates(giftCertificates.filter(c => c.id !== cert.id))}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'pages' && (
                    <CustomerPageEditor customPages={customPages} setCustomPages={setCustomPages} />
                )}
                {activeTab === 'settings' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">General Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Site Name</label>
                                    <input
                                        type="text"
                                        value={platformSettings.siteName}
                                        onChange={(e) => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Brand Color</label>
                                    <input
                                        type="color"
                                        value={platformSettings.brandColor}
                                        onChange={(e) => setPlatformSettings({...platformSettings, brandColor: e.target.value})}
                                        className="w-full p-3 border rounded h-12"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Support Email</label>
                                    <input
                                        type="email"
                                        value={platformSettings.supportEmail}
                                        onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Support Phone</label>
                                    <input
                                        type="tel"
                                        value={platformSettings.supportPhone}
                                        onChange={(e) => setPlatformSettings({...platformSettings, supportPhone: e.target.value})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1">Operating Hours</label>
                                    <input
                                        type="text"
                                        value={platformSettings.operatingHours}
                                        onChange={(e) => setPlatformSettings({...platformSettings, operatingHours: e.target.value})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1">Delivery ZIP Codes (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={platformSettings.deliveryZipCodes}
                                        onChange={(e) => setPlatformSettings({...platformSettings, deliveryZipCodes: e.target.value})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-bold mb-4">Financial Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Default Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.commissionRate * 100}
                                        onChange={(e) => setPlatformSettings({...platformSettings, commissionRate: parseFloat(e.target.value) / 100})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Base Delivery Fee ($)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.baseDeliveryFee}
                                        onChange={(e) => setPlatformSettings({...platformSettings, baseDeliveryFee: parseFloat(e.target.value)})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Per Mile Rate ($)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.perMileRate}
                                        onChange={(e) => setPlatformSettings({...platformSettings, perMileRate: parseFloat(e.target.value)})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.taxRate * 100}
                                        onChange={(e) => setPlatformSettings({...platformSettings, taxRate: parseFloat(e.target.value) / 100})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Platform Fee ($)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.platformFee}
                                        onChange={(e) => setPlatformSettings({...platformSettings, platformFee: parseFloat(e.target.value)})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Minimum Order Amount ($)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.minOrderAmount}
                                        onChange={(e) => setPlatformSettings({...platformSettings, minOrderAmount: parseFloat(e.target.value)})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-bold mb-4">Delivery Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Max Delivery Radius (miles)</label>
                                    <input
                                        type="number"
                                        value={platformSettings.maxDeliveryRadius}
                                        onChange={(e) => setPlatformSettings({...platformSettings, maxDeliveryRadius: parseFloat(e.target.value)})}
                                        className="w-full p-3 border rounded"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={platformSettings.maintenanceMode}
                                            onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                                            className="mr-2 w-5 h-5"
                                        />
                                        <span className="font-semibold">Maintenance Mode</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                                All settings are saved automatically
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const RestaurantBackendView = () => {
        const restaurant = restaurants.find(r => r.id === restaurantOwnerId);
        const [activeTab, setActiveTab] = useState('profile');
        const [newItem, setNewItem] = useState({ name: '', price: '', category: '', description: '' });
        const restaurantOrders = orders.filter(o => o.restaurantName === restaurant?.name);

        if (!restaurant) return <div>Restaurant not found</div>;

        return (
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">{restaurant.name} - Restaurant Backend</h1>
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Profile</button>
                    <button onClick={() => setActiveTab('menu')} className={`px-4 py-2 rounded ${activeTab === 'menu' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Menu</button>
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Orders</button>
                    <button onClick={() => setActiveTab('pos')} className={`px-4 py-2 rounded ${activeTab === 'pos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>POS Integration</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Settings</button>
                </div>

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Restaurant Profile</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Restaurant Name</label>
                                <input type="text" value={restaurant.name} onChange={(e) => updateRestaurant(restaurant.id, { name: e.target.value })} className="w-full p-3 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Cuisine Type</label>
                                <input type="text" value={restaurant.cuisine} onChange={(e) => updateRestaurant(restaurant.id, { cuisine: e.target.value })} className="w-full p-3 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Logo/Icon (Emoji)</label>
                                <input type="text" value={restaurant.image} onChange={(e) => updateRestaurant(restaurant.id, { image: e.target.value })} className="w-full p-3 border rounded text-4xl text-center" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                                <input type="tel" value={restaurant.phone || ''} onChange={(e) => updateRestaurant(restaurant.id, { phone: e.target.value })} className="w-full p-3 border rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-2">Address</label>
                                <input type="text" value={restaurant.address || ''} onChange={(e) => updateRestaurant(restaurant.id, { address: e.target.value })} className="w-full p-3 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Delivery Time</label>
                                <input type="text" value={restaurant.deliveryTime} onChange={(e) => updateRestaurant(restaurant.id, { deliveryTime: e.target.value })} className="w-full p-3 border rounded" placeholder="e.g., 25-35 min" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Delivery Fee ($)</label>
                                <input type="number" value={restaurant.deliveryFee} onChange={(e) => updateRestaurant(restaurant.id, { deliveryFee: parseFloat(e.target.value) })} className="w-full p-3 border rounded" />
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            ✓ All changes are saved automatically
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Menu Management</h2>
                            <button onClick={() => setEditingMenuItem(restaurant.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add Menu Item</button>
                        </div>

                        {editingMenuItem === restaurant.id && (
                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
                                <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="p-3 border rounded" />
                                <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} className="p-3 border rounded" />
                                <input type="text" placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="p-3 border rounded" />
                                <input type="text" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="p-3 border rounded" />
                                <button onClick={() => { addMenuItem(restaurant.id, {...newItem, price: parseFloat(newItem.price)}); setEditingMenuItem(null); setNewItem({name: '', price: '', category: '', description: ''}); }} className="bg-green-500 text-white px-4 py-2 rounded col-span-2">Save Item</button>
                            </div>
                        )}

                        {restaurant.menu.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No menu items yet. Add your first item!</p>
                        ) : (
                            <div className="space-y-3">
                                {restaurant.menu.map(item => (
                                    <div key={item.id} className="p-4 bg-gray-50 rounded">
                                        {editingMenuItemId === item.id ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={newItem.name || item.name}
                                                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                                    placeholder="Item Name"
                                                    className="p-2 border rounded"
                                                />
                                                <input
                                                    type="number"
                                                    value={newItem.price !== '' ? newItem.price : item.price}
                                                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                                    placeholder="Price"
                                                    className="p-2 border rounded"
                                                />
                                                <input
                                                    type="text"
                                                    value={newItem.category || item.category}
                                                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                                    placeholder="Category"
                                                    className="p-2 border rounded"
                                                />
                                                <input
                                                    type="text"
                                                    value={newItem.description || item.description}
                                                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                                    placeholder="Description"
                                                    className="p-2 border rounded"
                                                />
                                                <div className="col-span-2 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            updateMenuItem(restaurant.id, item.id, {
                                                                name: newItem.name || item.name,
                                                                price: newItem.price !== '' ? parseFloat(newItem.price) : item.price,
                                                                category: newItem.category || item.category,
                                                                description: newItem.description || item.description
                                                            });
                                                            setEditingMenuItemId(null);
                                                            setNewItem({name: '', price: '', category: '', description: ''});
                                                        }}
                                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingMenuItemId(null);
                                                            setNewItem({name: '', price: '', category: '', description: ''});
                                                        }}
                                                        className="bg-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-lg">{item.name}</p>
                                                    <p className="text-sm text-gray-600">{item.category} • {item.description}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                                                    <button
                                                        onClick={() => {
                                                            setEditingMenuItemId(item.id);
                                                            setNewItem({
                                                                name: item.name,
                                                                price: item.price,
                                                                category: item.category,
                                                                description: item.description
                                                            });
                                                        }}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button onClick={() => deleteMenuItem(restaurant.id, item.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Orders</h2>
                        {restaurantOrders.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No orders yet</p>
                        ) : (
                            <div className="space-y-4">
                                {restaurantOrders.map(order => (
                                    <div key={order.id} className="p-4 bg-gray-50 rounded border-2 border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                                <p className="text-sm text-gray-600">{new Date(order.timestamp).toLocaleString()}</p>
                                                <p className="text-sm text-gray-600">{order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                                                {order.posExternalId && (
                                                    <p className="text-sm text-blue-600 font-medium mt-1">
                                                        POS Order ID: {order.posExternalId}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl">${order.total.toFixed(2)}</p>
                                                <span className={`px-3 py-1 rounded text-sm ${order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                {order.posStatus && (
                                                    <div className="mt-2">
                                                        <span className="px-3 py-1 rounded text-sm bg-green-100 text-green-800">
                                                            POS: {order.posStatus.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2">Items:</h4>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm mb-1">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.orderType === 'delivery' && order.deliveryInfo && (
                                            <div className="border-t mt-3 pt-3">
                                                <p className="text-sm"><strong>Delivery Address:</strong> {order.deliveryInfo.address}</p>
                                                <p className="text-sm"><strong>Phone:</strong> {order.deliveryInfo.phone}</p>
                                            </div>
                                        )}
                                        {restaurant.posConfig?.enabled && (
                                            <div className="border-t mt-3 pt-3">
                                                <POSOrderManager
                                                    order={order}
                                                    restaurant={restaurant}
                                                    posConfig={restaurant.posConfig}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pos' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">POS Integration</h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">About POS Integration</h3>
                                <p className="text-sm text-blue-800">
                                    Connect your Point of Sale system to automatically sync your menu and send orders directly to your POS.
                                    Supports Toast, Square, and other major POS providers.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3">Configuration</h3>
                                <POSConfiguration
                                    restaurant={restaurant}
                                    onSave={(config) => {
                                        updateRestaurant(restaurant.id, { posConfig: config });
                                    }}
                                    onClose={() => {}}
                                />
                            </div>

                            {restaurant.posConfig?.enabled && (
                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg mb-3">Menu Synchronization</h3>
                                    <POSMenuSync
                                        restaurant={restaurant}
                                        posConfig={restaurant.posConfig}
                                        onMenuSynced={(syncedItems) => {
                                            const updatedMenu = [...restaurant.menu, ...syncedItems];
                                            updateRestaurant(restaurant.id, { menu: updatedMenu });
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Restaurant Settings</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Minimum Order Amount ($)</label>
                                <input type="number" value={restaurant.minOrderAmount} onChange={(e) => updateRestaurant(restaurant.id, { minOrderAmount: parseFloat(e.target.value) })} className="w-full p-3 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Delivery Radius (miles)</label>
                                <input type="number" value={restaurant.deliveryRadius} onChange={(e) => updateRestaurant(restaurant.id, { deliveryRadius: parseInt(e.target.value) })} className="w-full p-3 border rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={restaurant.isActive} onChange={(e) => updateRestaurant(restaurant.id, { isActive: e.target.checked })} className="mr-2 w-5 h-5" />
                                    <span className="font-semibold">Restaurant is Active (visible to customers)</span>
                                </label>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800"><strong>Commission Rate:</strong> {(restaurant.commissionRate * 100).toFixed(0)}%</p>
                            <p className="text-xs text-blue-600 mt-1">Contact platform admin to modify</p>
                        </div>
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            ✓ All settings are saved automatically
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {showLoginModal && <LoginModal />}
            {showProfileModal && <ProfileModal />}
            {selectedItemForOptions && (
                <MenuItemOptionsModal
                    item={selectedItemForOptions.item}
                    restaurantId={selectedItemForOptions.restaurantId}
                    onClose={() => setSelectedItemForOptions(null)}
                />
            )}

            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div onClick={() => setCurrentView(isAdmin ? 'admin' : isRestaurantOwner ? 'restaurant-backend' : 'landing')} className="text-2xl font-bold text-blue-500 cursor-pointer">
                        {platformSettings.siteName}
                    </div>
                    <div className="flex items-center gap-4">
                        {!isAdmin && !isRestaurantOwner && customPages.filter(p => p.isActive && p.showInNav).map(page => (
                            <button
                                key={page.id}
                                onClick={() => setCurrentView(`page-${page.slug}`)}
                                className="px-4 py-2 hover:text-blue-500"
                            >
                                {page.title}
                            </button>
                        ))}
                        {isAdmin && user && (
                            <>
                                <button onClick={() => setCurrentView('admin')} className="px-4 py-2 hover:text-blue-500">Backend</button>
                                <button onClick={() => setCurrentView('dispatch')} className="px-4 py-2 hover:text-blue-500">Dispatch</button>
                            </>
                        )}
                        {isRestaurantOwner && user && (
                            <button onClick={() => setCurrentView('restaurant-backend')} className="px-4 py-2 hover:text-blue-500">Restaurant Backend</button>
                        )}
                        {!isAdmin && !isRestaurantOwner && (
                            <>
                                {user && (
                                    <button onClick={() => setCurrentView('orders')} className="flex items-center gap-2 hover:text-blue-500">
                                        <Clock size={20} />Orders
                                    </button>
                                )}
                                <button onClick={() => setCurrentView('checkout')} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                    <ShoppingCart size={20} />Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                                    {cart.length > 0 && <span className="ml-1">${getCartTotal().toFixed(2)}</span>}
                                </button>
                            </>
                        )}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setCurrentView('account')}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                                >
                                    <User size={20} />
                                    <span>{user.name}</span>
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 font-semibold">
                                <User size={20} />
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <main>
                {currentView === 'landing' && <LandingPage />}
                {currentView === 'home' && <HomeView />}
                {currentView === 'menu' && selectedRestaurant && <MenuView restaurant={selectedRestaurant} />}
                {currentView === 'checkout' && <CheckoutView />}
                {currentView === 'orders' && <OrdersView />}
                {currentView === 'account' && user && <AccountPage />}
                {currentView === 'admin' && isAdmin && <AdminView />}
                {currentView === 'dispatch' && isAdmin && <DispatchView />}
                {currentView === 'restaurant-backend' && isRestaurantOwner && <RestaurantBackendView />}
                {currentView.startsWith('page-') && (() => {
                    const slug = currentView.replace('page-', '');
                    const page = customPages.find(p => p.slug === slug && p.isActive);
                    return <CustomPageView page={page} />;
                })()}
            </main>
        </div>
    );
};

export default DeliveryApp;
