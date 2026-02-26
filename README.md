# E-commerce Backend

Basic e-commerce API with Auth, Categories, Products, and Landing Page sections.

## MongoDB Schemas (Admin-managed images for landing page)

### LandingSection
One document per section. All images and copy are admin-managed.

| sectionKey | UI section | Admin-managed fields |
|------------|-------------|----------------------|
| `hero` | Hero banner | mainHeadline, subHeadline, backgroundImage, ctaButtonText, ctaButtonLink, featuredProductId |
| `best_collections` | Our Best Collections | title, subtitle |
| `find_perfect_purse` | Find Your Perfect Purse (category icons) | title, subtitle *(categories have iconImage)* |
| `elevate_look` | Elevate Your Everyday Look | title, mainImage, images[], textBlocks[] (title, description, ctaText, ctaLink) |
| `fresh_styles` | Fresh Styles Just Dropped | title, subtitle, sectionCtaText, sectionCtaLink |
| `testimonials` | What Our Clients Say | title, subtitle *(Testimonial collection)* |
| `crafted_confidence` | Crafted For Confidence | title, subtitle, sectionCtaText, sectionCtaLink *(Feature collection)* |

Common: title, subtitle, description, order, is_active, image, images.

### Category (Find Your Perfect Purse icons)
| Field     | Type    | Description |
|-----------|---------|-------------|
| name      | String  | e.g. "Tote Bags", "Clutch Bags" |
| slug      | String  | Unique URL slug |
| iconImage | String  | **Admin:** icon image URL for section |
| type      | String  | `product` |
| is_active | Boolean | Default true |

### Product
| Field          | Type     | Description |
|----------------|----------|-------------|
| name           | String   | Product name |
| slug           | String   | Unique URL slug |
| description    | String   | Product description |
| price          | Number   | Price |
| salePrice      | Number   | Optional; show "Sale" when set |
| categoryId     | ObjectId | Ref Category |
| image          | String   | **Admin:** primary image URL |
| tags           | [String] | `bestseller`, `hot`, `trending`, `sale` |
| colorVariants  | Array    | **Admin:** colour-wise images (see below) |
| averageRating  | Number   | 0–5 |
| numberOfReviews| Number   | Review count |
| isFeatured     | Boolean  | For "Our Best Collections" etc. |
| is_active      | Boolean  | Default true |

**colorVariants** (sub-document): colorName, colorCode (hex), images[] (URLs per colour).

### Testimonial (What Our Clients Say)
| Field        | Type    | Description |
|--------------|---------|-------------|
| clientName   | String  | **Admin**   |
| clientLocation| String | **Admin**   |
| clientImage  | String  | **Admin:** profile image URL |
| rating       | Number  | 1–5         |
| quote        | String  | **Admin**   |
| displayOrder | Number  | Order on page |
| is_active    | Boolean | Default true |

### Feature (Crafted For Confidence)
| Field        | Type    | Description |
|--------------|---------|-------------|
| title        | String  | e.g. "Premium Quality Materials" |
| description  | String  | Optional    |
| iconImage    | String  | **Admin:** icon image URL |
| displayOrder | Number  | Order on page |
| is_active    | Boolean | Default true |

## Structure

```
├── connection/
│   └── db.js
├── controller/
│   ├── Auth.js
│   ├── Category.js
│   ├── Product.js
│   ├── LandingSection.js
│   ├── Testimonial.js
│   └── Feature.js
├── models/
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── LandingSection.js
│   ├── Testimonial.js
│   └── Feature.js
├── routes/v1/
│   ├── AuthRoute.js
│   ├── CategoryRoute.js
│   ├── ProductRoute.js
│   ├── LandingSectionRoute.js
│   ├── TestimonialRoute.js
│   └── FeatureRoute.js
├── validators/
│   ├── Auth.js
│   ├── CategoryValidate.js
│   ├── ProductValidator.js
│   ├── LandingSectionValidator.js
│   ├── TestimonialValidator.js
│   └── FeatureValidator.js
├── index.js
└── package.json
```

## Setup

1. `npm install`
2. Create `.env` with:
   - `MONGO_URI` – MongoDB connection string
   - `PORT` – Server port (default 3000)
   - `JWT_SECRET` – Secret for JWT
   - `JWT_EXPIRES_IN` – e.g. `7d`
   - `RAZORPAY_KEY_ID` – Razorpay API key (for online payments)
   - `RAZORPAY_KEY_SECRET` – Razorpay API secret

## Run

- `npm run dev` – run once
- `npm start` – run with nodemon

## API (base: /api)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | /v1/auth/register | No  | Register (name, email, password) |
| POST   | /v1/auth/login    | No  | Login (email, password) |
| POST   | /v1/category/add   | Yes | Add category (name, slug, iconImage?, type?) |
| GET    | /v1/category/list  | No  | List categories |
| PUT    | /v1/category/update/:id | Yes | Update category |
| DELETE | /v1/category/delete/:id | Yes | Soft delete category |
| POST   | /v1/product/add   | Yes | Add product (name, slug, price, categoryId, image?, salePrice?, tags?, colorVariants?, isFeatured?) |
| GET    | /v1/product/list  | No  | List products (?categoryId, tag=bestseller\|hot\|trending\|sale, page, limit) |
| PUT    | /v1/product/update/:id | Yes | Update product |
| DELETE | /v1/product/delete/:id | Yes | Soft delete product |
| POST   | /v1/landing/section/add | Yes | Add section (sectionKey: hero, best_collections, find_perfect_purse, elevate_look, fresh_styles, testimonials, crafted_confidence) |
| GET    | /v1/landing/sections | No  | List all sections (populates featuredProductId for hero) |
| GET    | /v1/landing/section/:sectionKey | No  | Get one section by key |
| PUT    | /v1/landing/section/update/:id | Yes | Update section (all images & copy) |
| POST   | /v1/testimonial/add | Yes | Add testimonial (clientName, clientImage, rating, quote, clientLocation?, displayOrder?) |
| GET    | /v1/testimonial/list | No  | List testimonials |
| PUT    | /v1/testimonial/update/:id | Yes | Update testimonial |
| DELETE | /v1/testimonial/delete/:id | Yes | Soft delete testimonial |
| POST   | /v1/feature/add | Yes | Add feature (title, iconImage, description?, displayOrder?) |
| GET    | /v1/feature/list | No  | List features (Crafted For Confidence) |
| PUT    | /v1/feature/update/:id | Yes | Update feature |
| DELETE | /v1/feature/delete/:id | Yes | Soft delete feature |
| POST   | /v1/order/place | Yes | Place order (Cash on Delivery). Body: addressId, items: [{ productId, quantity }] |
| POST   | /v1/order/create-razorpay-order | Yes | Create order + Razorpay order for online payment. Same body as place. Returns order, razorpayOrderId, key_id |
| POST   | /v1/order/verify-razorpay-payment | Yes | Verify payment after Checkout. Body: orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature |
| GET    | /v1/order/list | Yes | List my orders (?page, limit, status) |
| GET    | /v1/order/:id | Yes | Get order details |

Protected routes use header: `Authorization: Bearer <token>`.

### Razorpay payment flow

1. **Create order and get Razorpay details**  
   `POST /api/v1/order/create-razorpay-order` with `addressId` and `items` (same as place order). Response includes `data.order`, `data.razorpayOrderId`, `data.key_id`, `data.amount`, `data.currency`.

2. **Open Razorpay Checkout** on the frontend using [Razorpay Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/checkout-form/) with `key_id`, `order_id` (razorpayOrderId), `amount`, and your `orderId` (for reference).

3. **On payment success**, call **Verify payment**:  
   `POST /api/v1/order/verify-razorpay-payment` with body:  
   `{ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }` (values from Checkout success handler).  
   Backend verifies the signature and sets `paymentStatus` to `confirmed`.
