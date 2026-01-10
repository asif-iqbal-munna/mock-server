# Backend Setup for Frontend Scenario Practice

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running locally on `mongodb://localhost:27017`

Or use MongoDB Atlas and set the connection string in `.env`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Run the Server
```bash
npm run dev
```

### 4. Seed the Database
```bash
curl -X POST http://localhost:5000/api/seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Regular user: `user@example.com` / `user123`
- 100 products
- 20 blog posts

---

## Scenario Mappings

### Scenario 1: Prevent Duplicate Form Submissions

**Endpoint:** `POST /api/forms/submit`

**Headers Required:**
- `Authorization: Bearer <token>`
- `Idempotency-Key: <unique-key>` (e.g., UUID)

**How to Practice:**
1. Get a token by logging in
2. Submit form with same `Idempotency-Key` multiple times
3. Backend will return existing submission on duplicates

**Example:**
```javascript
// First submission
fetch('http://localhost:5000/api/forms/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN',
    'Idempotency-Key': 'unique-id-12345'
  },
  body: JSON.stringify({
    formData: { name: 'John', email: 'john@example.com' }
  })
});

// Duplicate submission - will be prevented
fetch('http://localhost:5000/api/forms/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN',
    'Idempotency-Key': 'unique-id-12345' // Same key
  },
  body: JSON.stringify({
    formData: { name: 'John', email: 'john@example.com' }
  })
});
```

---

### Scenario 2: Search Large Product List

**Endpoint:** `GET /api/products/search`

**Query Parameters:**
- `q` - search query
- `page` - page number (default: 1)
- `limit` - items per page (default: 20)
- `category` - filter by category
- `minPrice` - minimum price
- `maxPrice` - maximum price

**How to Practice:**
1. Implement debounced search input
2. Use pagination for performance
3. Add infinite scroll or "Load More"

**Example:**
```javascript
// Debounced search
const searchProducts = debounce(async (query, page = 1) => {
  const response = await fetch(
    `http://localhost:5000/api/products/search?q=${query}&page=${page}&limit=20`
  );
  const data = await response.json();
  return data;
}, 300);
```

---

### Scenario 3: Handle Inconsistent API Data

**Endpoint:** `GET /api/products/:id`

**Behavior:** Randomly returns products with missing fields (imageUrl, description)

**How to Practice:**
1. Use optional chaining (`?.`)
2. Provide fallback values
3. Show placeholder images for missing data
4. Handle null/undefined gracefully

**Example:**
```javascript
const ProductCard = ({ product }) => {
  return (
    <div>
      <img 
        src={product?.imageUrl || '/placeholder.png'} 
        alt={product?.name || 'Product'}
      />
      <h3>{product?.name ?? 'Unknown Product'}</h3>
      <p>{product?.description || 'No description available'}</p>
      <span>Stock: {product?.stock ?? 0}</span>
    </div>
  );
};
```

---

### Scenario 4: Show Content Based on Auth Status

**Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

**How to Practice:**
1. Store JWT token in memory or cookies
2. Check auth status on mount
3. Conditionally render content
4. Redirect unauthenticated users

**Example:**
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// Check auth status
const checkAuth = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.ok ? await response.json() : null;
};
```

---

### Scenario 5: Slow First Load (Caching)

**Practice with:** Any endpoint

**How to Practice:**
1. Implement React Query / SWR for caching
2. Add loading states
3. Cache API responses
4. Use service workers for offline support

**Example with React Query:**
```javascript
import { useQuery } from '@tanstack/react-query';

const useProducts = (query) => {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => fetch(`/api/products/search?q=${query}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
```

---

### Scenario 6: Real-time Order Updates

**Endpoints:**
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update status (admin only)

**How to Practice:**
1. Implement polling (fetch every 5-10 seconds)
2. Use WebSockets (Socket.io) for real updates
3. Show status changes without refresh
4. Add optimistic updates

**Example with Polling:**
```javascript
const useOrderStatus = (orderId) => {
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    const pollOrder = async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrder(data);
    };
    
    pollOrder();
    const interval = setInterval(pollOrder, 5000); // Poll every 5s
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  return order;
};
```

---

### Scenario 7: Share State Across Components

**Endpoints:** All authenticated endpoints

**How to Practice:**
1. Use Context API for user data
2. Implement Zustand/Redux for global state
3. Share auth state across app
4. Sync state with API

**Example with Context:**
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth().then(setUser).finally(() => setLoading(false));
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### Scenario 8: Debug Multiple API Calls

**How to Practice:**
1. Open Network tab in DevTools
2. Watch for duplicate requests
3. Use `useEffect` dependencies correctly
4. Implement request cancellation

**Example:**
```javascript
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/products/search?q=laptop', {
    signal: controller.signal
  })
    .then(r => r.json())
    .then(setProducts)
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
  
  return () => controller.abort(); // Cancel on unmount
}, [/* proper dependencies */]);
```

---

### Scenario 9: SEO with Next.js

**Endpoints:**
- `GET /api/blog/posts` - List posts
- `GET /api/blog/posts/:slug` - Single post

**How to Practice:**
1. Use `getStaticProps` / `getServerSideProps`
2. Generate meta tags from API data
3. Implement `generateStaticParams`
4. Add JSON-LD structured data

**Example with Next.js App Router:**
```javascript
// app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await fetch(`http://localhost:5000/api/blog/posts/${params.slug}`)
    .then(r => r.json());
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
    }
  };
}

export default async function BlogPost({ params }) {
  const post = await fetch(`http://localhost:5000/api/blog/posts/${params.slug}`)
    .then(r => r.json());
  
  return <article>{/* render post */}</article>;
}
```

---

### Scenario 10: Role-Based Access Control

**Endpoints:**
- `POST /api/products` - Admin only
- `PATCH /api/orders/:id/status` - Admin only
- `POST /api/blog/posts` - Admin only

**How to Practice:**
1. Check user role from JWT
2. Hide/show UI based on role
3. Protect routes with middleware
4. Handle 403 errors gracefully

**Example:**
```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Access Denied</div>;
  }
  
  return children;
};

// Usage
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"user"}'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Use the Token
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Common Headers

**Authentication:**
```
Authorization: Bearer <your-jwt-token>
```

**Idempotency (for form submissions):**
```
Idempotency-Key: <unique-identifier>
```

**Content Type:**
```
Content-Type: application/json
```

---

## Tips for Practice

1. **Use Postman/Insomnia** to test endpoints first
2. **Check Network Tab** in DevTools to see actual requests
3. **Start Simple** - get one scenario working before moving to the next
4. **Read Error Messages** - the API returns helpful error messages
5. **Use React DevTools** to inspect component state
6. **Enable CORS** - already configured in the backend

Happy practicing! 🚀#   m o c k - s e r v e r  
 