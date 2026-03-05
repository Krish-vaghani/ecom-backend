# Admin – Landing Page & Product APIs

Base URL: `https://api.pursolina.com/api`  
All admin endpoints require: **Header** `Authorization: Bearer <admin_token>`

---

## Overview – New Flow

Products now carry a `landingSection` field (enum) that determines which section they appear in on the landing page.

| `landingSection` value | Landing section |
|---|---|
| `"hero"` | Hero section |
| `"best_collections"` | Best Collections |
| `"elevate_look"` | Elevate Look |
| `"fresh_styles"` | Fresh Styles |
| `null` (default) | Regular product only – not on landing page |

**Admin flow:**
1. Call **GET** `/admin/product/list` to see all products and their current `landingSection` assignment.
2. To assign a product to a landing section, call **PUT** `/admin/product/update/:id` with `{ "landingSection": "best_collections" }`.
3. To remove a product from a landing section, send `{ "landingSection": null }`.
4. The landing page (**GET** `/v1/landing`) automatically reflects these assignments – no separate section-update call needed.

---

## 1. Admin – List all products

**GET** `/admin/product/list`

Shows **all products** (active + inactive) with their `landingSection` assignment.

### Query parameters

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `category` | string | Filter by `jwellery` or `purse` |
| `tag` | string | Filter by `bestseller`, `hot`, `trending`, `sale` |
| `landingSection` | string | Filter by `hero`, `best_collections`, `elevate_look`, `fresh_styles` |
| `is_active` | boolean string | `"true"` or `"false"` to filter by active status |

```bash
curl --location 'https://api.pursolina.com/api/admin/product/list' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN'
```

**Response (200):**
```json
{
  "message": "Products fetched.",
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Classic Purse",
      "slug": "classic-purse",
      "category": "purse",
      "price": 1999,
      "salePrice": null,
      "landingSection": "best_collections",
      "tags": ["bestseller"],
      "is_active": true,
      "colorVariants": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

## 2. Add a product (with optional landing section)

**POST** `/admin/product/add`

```bash
curl --location 'https://api.pursolina.com/api/admin/product/add' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{
  "name": "Golden Jhumka",
  "slug": "golden-jhumka",
  "category": "jwellery",
  "price": 2499,
  "salePrice": 1999,
  "landingSection": "best_collections",
  "tags": ["bestseller"],
  "image": "https://example.com/img.jpg",
  "colorVariants": [
    { "colorCode": "#FFD700", "colorName": "Gold", "images": ["https://example.com/gold.jpg"], "default": true }
  ]
}'
```

`landingSection` values: `"hero"`, `"best_collections"`, `"elevate_look"`, `"fresh_styles"`, or omit/`null` for no landing section.

---

## 3. Update a product – assign / remove landing section

**PUT** `/admin/product/update/:id`

```bash
# Assign to Best Collections
curl --location --request PUT 'https://api.pursolina.com/api/admin/product/update/PRODUCT_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{ "landingSection": "best_collections" }'

# Move to Elevate Look
curl --location --request PUT 'https://api.pursolina.com/api/admin/product/update/PRODUCT_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{ "landingSection": "elevate_look" }'

# Remove from landing page
curl --location --request PUT 'https://api.pursolina.com/api/admin/product/update/PRODUCT_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{ "landingSection": null }'
```

---

## 4. Get all landing sections (admin view)

**GET** `/admin/landing`

Returns section config (from LandingSection docs) merged with products from the Product collection grouped by `landingSection`.

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
      "sectionKey": "hero",
      "_id": "...",
      "order": 0,
      "is_active": true,
      "images": ["https://example.com/hero1.jpg"],
      "price": 2499,
      "rating": 4.5,
      "numberOfReviews": 42,
      "products": [
        {
          "_id": "...",
          "name": "Featured Purse",
          "landingSection": "hero",
          "price": 2499,
          "colorVariants": [...],
          ...
        }
      ]
    },
    "best_collections": {
      "sectionKey": "best_collections",
      "products": [ { "_id": "...", "name": "Classic Purse", "landingSection": "best_collections", ... } ]
    },
    "elevate_look": {
      "sectionKey": "elevate_look",
      "products": [ ... ]
    },
    "fresh_styles": {
      "sectionKey": "fresh_styles",
      "products": [ ... ]
    }
  }
}
```

---

## 5. Hero section config (images / price / rating)

The hero section still supports storing banner images, price, and rating via the LandingSection document. These appear alongside the `products` array in the response.

### Create hero config (only if it does not exist)

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

### Update hero config

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

---

## 6. Generic section update (order / is_active)

**PUT** `/admin/landing/section/update/:id`

Use the section `_id` from **GET** `/admin/landing` to patch metadata fields (`order`, `is_active`, etc.).

```bash
curl --location --request PUT 'https://api.pursolina.com/api/admin/landing/section/update/SECTION_ID' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
--data '{ "order": 1, "is_active": true }'
```

---

## 7. Public – Product listing (with optional landingSection filter)

**GET** `/v1/product/list`

```bash
# All active products
GET /v1/product/list?page=1&limit=10

# Only best_collections products
GET /v1/product/list?landingSection=best_collections

# Filter by category and landing section
GET /v1/product/list?category=purse&landingSection=fresh_styles
```

Each product in the response includes the `landingSection` field.

---

## 8. Public – Landing page

**GET** `/v1/landing`

Automatically returns products grouped by their `landingSection` field.

```json
{
  "message": "Landing page data fetched.",
  "data": {
    "hero": {
      "images": ["https://example.com/hero1.jpg"],
      "price": 2499,
      "rating": 4.5,
      "numberOfReviews": 42,
      "products": [ { "_id": "...", "name": "...", "landingSection": "hero", ... } ]
    },
    "best_collections": [ { "_id": "...", "landingSection": "best_collections", ... } ],
    "elevate_look": [ { "_id": "...", "landingSection": "elevate_look", ... } ],
    "fresh_styles": [ { "_id": "...", "landingSection": "fresh_styles", ... } ]
  }
}
```

---

## `landingSection` enum values

| Value | Display Name |
|---|---|
| `"hero"` | Hero |
| `"best_collections"` | Best Collections |
| `"elevate_look"` | Elevate Look |
| `"fresh_styles"` | Fresh Styles |
| `null` | (not on landing page) |

---

## Error responses

- **400** – Validation error: `{ "message": "error detail" }`
- **401** – Missing or invalid admin token
- **404** – Product / section not found
- **409** – Section already exists (use update instead of create)
- **500** – `{ "message": "Server error.", "error": "..." }`

---

## Admin panel integration prompt

- **Base URL:** `https://api.pursolina.com/api`. All requests need header: `Authorization: Bearer <admin_token>`.
- **List all products:** **GET** `/admin/product/list`. Supports query params: `page`, `limit`, `category`, `tag`, `landingSection` (`hero`/`best_collections`/`elevate_look`/`fresh_styles`), `is_active`.
- **Assign to landing section:** On a product card/row show a dropdown with options: None, Hero, Best Collections, Elevate Look, Fresh Styles. On change call **PUT** `/admin/product/update/:id` with `{ "landingSection": "<value or null>" }`.
- **Landing page data:** **GET** `/admin/landing` returns all four sections with their currently-assigned products and section config. Use to preview the landing page from admin.
- **Hero banner config:** Use **POST** `/admin/landing/hero` (first time) or **PUT** `/admin/landing/hero` to set `images`, `price`, `rating`, `numberOfReviews` for the hero banner independently from products.
- **Section order/visibility:** Use **PUT** `/admin/landing/section/update/:id` to toggle `is_active` or change `order` for any section.
