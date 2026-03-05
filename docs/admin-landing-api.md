# Admin – Landing Page APIs

Base URL: `https://api.pursolina.com/api`  
All admin endpoints require: **Header** `Authorization: Bearer <admin_token>`

---

## 1. Get all landing sections (for binding forms)

**GET** `/admin/landing`

```bash
curl --location 'https://api.pursolina.com/api/admin/landing' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response (200):**
```json
{
  "message": "Landing page data fetched.",
  "data": {
    "hero": {
      "_id": "69a6a750edd1d00ca9626ddc",
      "sectionKey": "hero",
      "order": 0,
      "is_active": true,
      "images": ["https://example.com/hero1.jpg", "https://example.com/hero2.jpg"],
      "price": 2499,
      "originalPrice": 2999,
      "rating": 4.5,
      "numberOfReviews": 42,
      "createdAt": "2026-03-03T09:18:08.811Z",
      "updatedAt": "2026-03-03T09:35:23.621Z"
    },
    "best_collections": {
      "_id": "69a6a750edd1d00ca9626dd1",
      "sectionKey": "best_collections",
      "order": 1,
      "is_active": true,
      "products": [
        {
          "product": "69a6a750edd1d00ca9626dd0",
          "images": ["https://example.com/p1.jpg"],
          "price": 1999,
          "originalPrice": 2499,
          "rating": 4.2,
          "numberOfReviews": 18,
          "tags": ["bestseller"],
          "colors": [{ "colorCode": "#000", "images": "https://example.com/p1.jpg" }]
        }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    },
    "elevate_look": {
      "_id": "69a6a750edd1d00ca9626dd2",
      "sectionKey": "elevate_look",
      "order": 2,
      "is_active": true,
      "products": [ /* 4 items */ ],
      "createdAt": "...",
      "updatedAt": "..."
    },
    "fresh_styles": {
      "_id": "69a6a750edd1d00ca9626dd3",
      "sectionKey": "fresh_styles",
      "order": 3,
      "is_active": true,
      "products": [ /* multiple items */ ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## 2. Update any section by ID (generic)

**PUT** `/admin/landing/section/update/:id`

Use the section `_id` from GET admin/landing. Body can include any allowed fields (order, is_active, images, price, products, etc.).

```bash
curl --location --request PUT 'https://api.pursolina.com/api/admin/landing/section/update/SECTION_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 1,
  "is_active": true,
  "images": ["https://example.com/new.jpg"]
}'
```

**Response (200):**
```json
{
  "message": "Section updated.",
  "data": { "_id": "...", "sectionKey": "hero", "order": 1, "is_active": true, "images": ["..."], ... }
}
```

---

## 3. Hero section

### Create hero (only if hero does not exist)

**POST** `/admin/landing/hero`

```bash
curl --location 'https://api.pursolina.com/api/admin/landing/hero' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "images": ["https://example.com/hero1.jpg", "https://example.com/hero2.jpg"],
  "price": 2499,
  "rating": 4.5,
  "numberOfReviews": 42
}'
```

**Response (200):**
```json
{
  "message": "Hero section created.",
  "data": {
    "_id": "69a6a750edd1d00ca9626ddc",
    "sectionKey": "hero",
    "order": 0,
    "is_active": true,
    "images": ["https://example.com/hero1.jpg", "https://example.com/hero2.jpg"],
    "price": 2499,
    "rating": 4.5,
    "numberOfReviews": 42
  }
}
```

**If hero already exists (409):**
```json
{ "message": "Hero section already exists. Use update instead." }
```

### Update hero

**PUT** `/admin/landing/hero`

```bash
curl --location --request PUT 'https://api.pursolina.com/api/admin/landing/hero' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "images": ["https://example.com/hero-new.jpg"],
  "price": 2599,
  "rating": 4.6,
  "numberOfReviews": 50
}'
```

**Response (200):**
```json
{
  "message": "Hero section updated.",
  "data": { "_id": "...", "sectionKey": "hero", "images": ["..."], "price": 2599, ... }
}
```

---

## 4. Best collections section

### Create (only if section does not exist)

**POST** `/admin/landing/best-collections`

```bash
curl --location 'https://api.pursolina.com/api/admin/landing/best-collections' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 1,
  "is_active": true,
  "products": [
    {
      "product": "PRODUCT_MONGO_ID",
      "images": ["https://example.com/p1.jpg"],
      "price": 1999,
      "originalPrice": 2499,
      "rating": 4.2,
      "numberOfReviews": 18,
      "tags": ["bestseller"],
      "colors": [{ "colorCode": "#000", "images": "https://example.com/p1.jpg" }]
    }
  ]
}'
```

**Response (200):**
```json
{
  "message": "Best collections section created.",
  "data": { "_id": "...", "sectionKey": "best_collections", "order": 1, "products": [...] }
}
```

### Update best collections

**PUT** `/admin/landing/best-collections`

```bash
curl --location --request PUT 'https://api.pursolina.com/api/admin/landing/best-collections' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 1,
  "is_active": true,
  "products": [
    {
      "product": "PRODUCT_MONGO_ID",
      "images": ["https://example.com/p1.jpg"],
      "price": 1999,
      "originalPrice": 2499,
      "rating": 4.2,
      "numberOfReviews": 18,
      "tags": ["bestseller"],
      "colors": []
    }
  ]
}'
```

**Response (200):**
```json
{
  "message": "Best collections section updated.",
  "data": { "_id": "...", "sectionKey": "best_collections", "products": [...] }
}
```

---

## 5. Elevate look section (exactly 4 products)

### Create

**POST** `/admin/landing/elevate-look`

```bash
curl --location 'https://api.pursolina.com/api/admin/landing/elevate-look' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 2,
  "products": [
    { "product": "ID1", "images": ["url1"], "price": 1999, "originalPrice": null, "rating": 4, "numberOfReviews": 10, "tags": [], "colors": [] },
    { "product": "ID2", "images": ["url2"], "price": 2199, "originalPrice": null, "rating": 4.2, "numberOfReviews": 8, "tags": [], "colors": [] },
    { "product": "ID3", "images": ["url3"], "price": 1899, "originalPrice": null, "rating": 4.5, "numberOfReviews": 12, "tags": [], "colors": [] },
    { "product": "ID4", "images": ["url4"], "price": 2399, "originalPrice": null, "rating": 4.1, "numberOfReviews": 6, "tags": [], "colors": [] }
  ]
}'
```

**Response (200):**
```json
{
  "message": "Elevate look section created.",
  "data": { "_id": "...", "sectionKey": "elevate_look", "products": [/* 4 items */] }
}
```

### Update

**PUT** `/admin/landing/elevate-look`

```bash
curl --location --request PUT 'https://api.pursolina.com/api/admin/landing/elevate-look' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 2,
  "products": [
    { "product": "ID1", "images": ["url1"], "price": 1999, "originalPrice": null, "rating": 4, "numberOfReviews": 10, "tags": [], "colors": [] },
    { "product": "ID2", "images": ["url2"], "price": 2199, "originalPrice": null, "rating": 4.2, "numberOfReviews": 8, "tags": [], "colors": [] },
    { "product": "ID3", "images": ["url3"], "price": 1899, "originalPrice": null, "rating": 4.5, "numberOfReviews": 12, "tags": [], "colors": [] },
    { "product": "ID4", "images": ["url4"], "price": 2399, "originalPrice": null, "rating": 4.1, "numberOfReviews": 6, "tags": [], "colors": [] }
  ]
}'
```

**Response (200):**
```json
{
  "message": "Elevate look section updated.",
  "data": { "_id": "...", "sectionKey": "elevate_look", "products": [...] }
}
```

---

## 6. Fresh styles section

### Create

**POST** `/admin/landing/fresh-styles`

```bash
curl --location 'https://api.pursolina.com/api/admin/landing/fresh-styles' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 3,
  "is_active": true,
  "products": [
    {
      "product": "PRODUCT_MONGO_ID",
      "images": ["https://example.com/p1.jpg"],
      "price": 1799,
      "originalPrice": 2199,
      "rating": 4.0,
      "numberOfReviews": 25,
      "tags": ["trending"],
      "colors": []
    }
  ]
}'
```

**Response (200):**
```json
{
  "message": "Fresh styles section created.",
  "data": { "_id": "...", "sectionKey": "fresh_styles", "order": 3, "products": [...] }
}
```

### Update

**PUT** `/admin/landing/fresh-styles`

```bash
curl --location --request PUT 'https://api.pursolina.com/api/admin/landing/fresh-styles' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "order": 3,
  "is_active": true,
  "products": [
    { "product": "ID1", "images": ["url1"], "price": 1799, "originalPrice": 2199, "rating": 4, "numberOfReviews": 25, "tags": ["trending"], "colors": [] }
  ]
}'
```

**Response (200):**
```json
{
  "message": "Fresh styles section updated.",
  "data": { "_id": "...", "sectionKey": "fresh_styles", "products": [...] }
}
```

---

## Product item shape (for products array)

Each item in `products` can have:

| Field            | Type     | Required | Notes |
|-----------------|----------|----------|--------|
| `product`       | string   | No       | MongoDB Product _id (links to product detail page) |
| `images`        | string[] | No       | Image URLs for this item |
| `price`         | number   | No       | Display price |
| `originalPrice`| number   | No       | Strikethrough price |
| `rating`        | number   | No       | 0–5 |
| `numberOfReviews` | number | No       | Count |
| `tags`          | string[] | No       | `bestseller`, `hot`, `trending`, `sale` |
| `colors`        | array    | No       | `[{ "colorCode": "#hex", "images": "url" }]` |

---

## Error responses

- **400** – Validation error: `{ "message": "error detail" }`
- **401** – Missing or invalid admin token
- **404** – Section not found (e.g. wrong id in section/update/:id)
- **409** – Section already exists (use update instead of create)
- **500** – `{ "message": "Server error.", "error": "..." }`

---

## Prompt for admin panel (copy-paste)

Use this prompt when building or wiring the landing-page section in the admin panel:

---

**Landing page – Admin panel integration**

- **Base URL:** `https://api.pursolina.com/api`. All requests need header: `Authorization: Bearer <admin_token>` (from admin login).
- **Load data:** On landing/settings page load, call **GET** `/admin/landing`. Response has `data.hero`, `data.best_collections`, `data.elevate_look`, `data.fresh_styles`. Each section has `_id`, `sectionKey`, `order`, `is_active`, and for hero: `images`, `price`, `rating`, `numberOfReviews`; for the other three: `products` (array of items with `product` id, `images`, `price`, `originalPrice`, `rating`, `numberOfReviews`, `tags`, `colors`). Use these to prefill forms and to decide create vs update.
- **Hero:** One block. If `data.hero` exists, show edit form and on save call **PUT** `/admin/landing/hero` with body `{ images[], price, rating, numberOfReviews }`. If no hero, show “Create hero” and call **POST** `/admin/landing/hero` with same body.
- **Best collections:** List of products. If `data.best_collections` exists, on save call **PUT** `/admin/landing/best-collections` with body `{ order?, is_active?, products[] }`. Each product: `{ product? (Mongo id), images[], price?, originalPrice?, rating?, numberOfReviews?, tags?, colors[] }`. If section doesn’t exist, use **POST** `/admin/landing/best-collections` with same body.
- **Elevate look:** Exactly 4 products. If section exists, on save **PUT** `/admin/landing/elevate-look` with `{ order?, products[] }` (4 items). If not, **POST** `/admin/landing/elevate-look` with same. Product shape same as above.
- **Fresh styles:** Same as best collections (multiple products). **PUT** or **POST** `/admin/landing/fresh-styles` with `{ order?, is_active?, products[] }`.
- **Generic section update:** To patch any section by id (e.g. only `order` or `is_active`), use **PUT** `/admin/landing/section/update/:id` with body containing only the fields to update. `id` = section `_id` from GET response.
- **Product picker:** For each product row in best_collections / elevate_look / fresh_styles, allow picking an existing product (from product list API). Store that product’s `_id` in `product` and optionally sync `images`, `price`, `originalPrice`, `rating`, `numberOfReviews` from product API or let admin edit. Tags: one or more of `bestseller`, `hot`, `trending`, `sale`.
- **Errors:** Show `response.data.message` or `response.message` on 4xx/5xx. 409 = “Section already exists, use update” (switch form to update and refetch).

---
