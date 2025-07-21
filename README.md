This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


<!-- 

import { Product, User } from "../types/types";

const BASE_URL = "https://dummyjson.com";

function getToken(): string | null {
  return localStorage.getItem("token");
}


// 1. Login → POST /auth/login
export async function loginUser(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json(); // contains token
}

// 2. Get current user → GET /auth/me
export async function getLoggedInUser(): Promise<User> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

// 3. Refresh token → GET /auth/refresh
export async function refreshToken() {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  return res.json(); // new token
}

// 4. Get all products → GET /products
export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  const data = await res.json();
  return data.products;
}

// 5. Get product by ID → GET /products/{id}
export async function getProductById(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

// 6. Search products → GET /products/search?q=...
export async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products/search?q=${query}`);
  const data = await res.json();
  return data.products;
}



 --># nextJs6Api
