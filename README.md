# URL Shortener - System Design Project

A production-ready URL shortener application built as a learning-focused system design project. This project demonstrates core backend concepts including REST APIs, database optimization, caching strategies, scalability patterns, and security best practices.

## 🎯 Project Goals

This project is designed to teach and demonstrate:
- **REST API Design** - Clean, RESTful endpoints
- **Database & Indexing** - MongoDB with optimized indexes for read-heavy workloads
- **Caching Strategies** - Redis caching with hit/miss/fallback patterns
- **Scalability & Performance** - Read-heavy system optimization
- **Security & Reliability** - URL validation, rate limiting, malicious link protection
- **System Design Trade-offs** - Understanding when to use cache vs database

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Primary database
- **Redis** - Caching layer
- **Mongoose** - MongoDB ODM

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

## ✨ Features

### Core Features
- ✅ **URL Shortening** - Convert long URLs to short codes using Base62 encoding
- ✅ **Auto-generated Short Codes** - Unique 7-character codes
- ✅ **Custom Aliases** - User-defined short codes (3-20 characters)
- ✅ **URL Validation** - Format and security validation
- ✅ **URL Expiration (TTL)** - Optional expiration dates with automatic cleanup
- ✅ **Click Tracking** - Comprehensive analytics for each shortened URL
- ✅ **QR Code Generation** - Generate QR codes for easy sharing
- ✅ **Malicious URL Protection** - Basic security checks for suspicious URLs

### Advanced Features
- ✅ **Redis Caching** - Cache hit/miss with database fallback
- ✅ **TTL-based Cache Eviction** - Automatic cache expiration
- ✅ **Analytics Dashboard** - Click counts, timestamps, referer tracking
- ✅ **Read-Heavy Optimization** - Database indexes, caching strategies
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **Error Handling** - Graceful error handling and fallbacks

## 📁 Project Structure

```
url-shortener/
├── server/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   ├── redis.js         # Redis connection
│   │   └── constants.js     # Application constants
│   ├── models/
│   │   └── Url.js           # URL schema with indexes
│   ├── routes/
│   │   ├── urlRoutes.js     # URL shortening endpoints
│   │   └── analyticsRoutes.js # Analytics endpoints
│   ├── services/
│   │   └── urlService.js    # Business logic & caching
│   ├── utils/
│   │   ├── base62.js        # Base62 encoding/decoding
│   │   └── urlValidator.js  # URL validation & security
│   └── index.js             # Express server setup
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.js           # Main app component
│   └── public/
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Redis (running locally or connection string)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/urlshortener
   REDIS_HOST=localhost
   REDIS_PORT=6379
   BASE_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:3000
   
   # Supabase Configuration
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

3. **Start MongoDB and Redis:**
   ```bash
   # MongoDB (if running locally)
   mongod

   # Redis (if running locally)
   redis-server
   ```

4. **Run the application:**
   ```bash
   # Development mode (runs both server and client)
   npm run dev

   # Or run separately:
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📡 API Endpoints

### URL Shortening
- `POST /api/url/shorten` - Create a shortened URL
  ```json
  {
    "originalUrl": "https://example.com/very/long/url",
    "customAlias": "optional-alias",
    "expiresInDays": 30
  }
  ```

### URL Access
- `GET /:shortCode` - Redirect to original URL (root level)
- `GET /api/url/:shortCode/info` - Get URL info without redirecting
- `GET /api/url/:shortCode/qr` - Get QR code image

### Analytics
- `GET /api/analytics/:shortCode` - Get analytics for a short URL

## 🏗️ Architecture & Design Decisions

### Base62 Encoding
- Uses Base62 (0-9, a-z, A-Z) for short code generation
- Provides 62^7 ≈ 3.5 trillion possible combinations
- More URL-friendly than Base64 (no special characters)

### Caching Strategy (Read-Heavy Optimization)

**Cache-Aside Pattern:**
1. **Cache Hit**: Return from Redis (fast path)
2. **Cache Miss**: Query MongoDB, then cache result
3. **TTL**: 24-hour cache expiration
4. **Fallback**: If Redis fails, fallback to database

**Why This Works:**
- Most URL shorteners are read-heavy (many more reads than writes)
- Caching frequently accessed URLs reduces database load
- TTL ensures cache freshness while reducing memory usage

### Database Indexing

**Optimized Indexes:**
- `shortCode` - Unique index for fast lookups
- `shortCode + isActive` - Compound index for active URL queries
- `expiresAt` - TTL index for automatic expiration cleanup
- `createdAt` - Index for sorting/analytics queries

### URL Expiration

- Uses MongoDB TTL index for automatic document deletion
- Cache TTL aligns with document expiration
- Prevents database bloat from expired URLs

### Analytics Storage

- Embedded analytics in URL document (good for small scale)
- Keeps last 1000 clicks to prevent document bloat
- For larger scale, consider separate analytics collection

## 🔒 Security Features

1. **URL Validation**
   - Format validation (must include http:// or https://)
   - Malicious pattern detection (javascript:, data:, etc.)
   - Localhost/internal IP blocking in production

2. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Prevents API abuse

3. **Helmet.js**
   - Security headers for XSS, clickjacking protection

4. **Input Sanitization**
   - Custom alias validation (alphanumeric + hyphens only)
   - Reserved word protection

## 📊 Performance Optimizations

### Read-Heavy System Optimizations

1. **Redis Caching**
   - Reduces database queries by ~90% for popular URLs
   - Sub-millisecond response times for cached URLs

2. **Database Indexes**
   - Optimized indexes for common query patterns
   - Compound indexes for multi-field queries

3. **Connection Pooling**
   - MongoDB connection pooling
   - Redis connection reuse

4. **QR Code Caching**
   - QR codes cached in Redis (24-hour TTL)
   - Reduces CPU-intensive QR generation

## 🧪 Testing the System

### Test URL Shortening
```bash
curl -X POST http://localhost:5000/api/url/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.google.com"}'
```

### Test Redirect
```bash
# Visit the short URL in browser or:
curl -I http://localhost:5000/abc123
```

### Test Analytics
```bash
curl http://localhost:5000/api/analytics/abc123
```

## 🚀 Scaling Considerations

### Current Design (Good for ~1M URLs)
- Single MongoDB instance
- Single Redis instance
- Embedded analytics

### For Larger Scale (10M+ URLs)

1. **Database Sharding**
   - Shard by shortCode hash
   - Distribute load across multiple MongoDB instances

2. **Redis Cluster**
   - Redis Cluster for distributed caching
   - Consistent hashing for key distribution

3. **Separate Analytics**
   - Move analytics to separate collection/database
   - Use time-series database (InfluxDB, TimescaleDB)
   - Batch analytics writes

4. **CDN for Static Assets**
   - Serve QR codes via CDN
   - Cache static frontend assets

5. **Load Balancing**
   - Multiple Express instances behind load balancer
   - Session affinity not needed (stateless API)

6. **Database Read Replicas**
   - Read replicas for analytics queries
   - Primary for writes, replicas for reads

## 📝 Learning Outcomes

After completing this project, you'll understand:

- How to design RESTful APIs
- Database indexing strategies for read-heavy workloads
- Caching patterns (cache-aside, TTL)
- System design trade-offs (cache vs database, consistency vs performance)
- Security best practices for web APIs
- Performance optimization techniques
- Scalability patterns for distributed systems

## 🤝 Contributing

This is a learning project. Feel free to:
- Add new features
- Optimize existing code
- Improve documentation
- Fix bugs

## 📄 License

MIT License - Feel free to use this project for learning purposes.

## 🙏 Acknowledgments

Built as a comprehensive system design learning project covering:
- URL shortening algorithms
- Caching strategies
- Database optimization
- API design patterns
- Security best practices
