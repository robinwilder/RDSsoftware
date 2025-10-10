# RDSsoftware - QuickEats Food Delivery Platform

A comprehensive food delivery platform built with React, featuring admin backend management, customer ordering interface, driver tracking, and a powerful WYSIWYG content editor.

## Features

### Customer Features
- Browse restaurants and menus
- Customizable menu items with options (size, toppings, sides, etc.)
- Shopping cart with real-time pricing
- Delivery and pickup order options
- Order tracking
- Custom page viewing (About Us, Terms, etc.)
- Landing page with editable content

### Admin Features
- Restaurant management (create, edit, activate/deactivate)
- Menu item management with customizable options
- Order tracking and management
- Driver assignment and tracking
- Platform settings configuration
- Coupon and discount system
- Gift certificate management
- **WYSIWYG Page Editor** - Create and edit custom pages with rich text formatting
- **Landing Page Editor** - Customize the main landing page content

### Restaurant Owner Features
- Manage own restaurant details
- Edit menu items and pricing
- Configure menu item options and modifiers
- View and manage incoming orders
- POS system integration (Square, Toast)

### Driver Features
- View assigned deliveries
- Update delivery status
- Track delivery locations

### POS Integration
- Square POS support
- Toast POS support
- Menu synchronization
- Order management integration

## Technology Stack

- **Frontend**: React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **WYSIWYG Editor**: TipTap
- **Version Control**: Git

## Installation

1. Clone the repository:
```bash
git clone git@github.com:robinwilder/RDSsoftware.git
cd rdssoftware
```

2. Install dependencies:
```bash
cd quickeats-app
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
rdssoftware/
├── quickeats-app/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomPageView.js
│   │   │   ├── CustomerPageEditor.js
│   │   │   ├── WYSIWYGEditor.js
│   │   │   └── pos/
│   │   │       ├── POSConfiguration.js
│   │   │       ├── POSMenuSync.js
│   │   │       └── POSOrderManager.js
│   │   ├── services/
│   │   │   └── pos/
│   │   │       ├── BasePOSService.js
│   │   │       ├── POSManager.js
│   │   │       ├── SquarePOSService.js
│   │   │       └── ToastPOSService.js
│   │   ├── types/
│   │   │   └── pos.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Usage

### Accessing Admin Panel
Click "Admin Login" to access the administrative backend with full platform management capabilities.

### Accessing Restaurant Owner Panel
Click "Restaurant Login" to manage your restaurant, menu, and orders.

### Editing Custom Pages
1. Login as Admin
2. Navigate to the "Pages" tab
3. Create new pages or edit existing ones using the WYSIWYG editor
4. Configure page settings (URL slug, visibility, navigation)
5. Save and publish

### Editing Landing Page
1. Login as Admin
2. Go to "Pages" tab
3. Select "Landing Page" from the page list
4. Edit content using the rich text editor
5. Preview and save changes

## Contributing

This is a private project. For questions or contributions, please contact the repository owner.

## License

Proprietary - All rights reserved