# ⚡ PriceCompareHub

> Compare product prices across **Amazon**, **Flipkart**, and **Myntra** — instantly.

![Stack](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=node.js)
![Stack](https://img.shields.io/badge/AWS-DynamoDB-FF9900?style=flat-square&logo=amazon-aws)
![Stack](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

---

## 📁 Project Structure

```
price-compare-app/
├── frontend/               # React.js app
│   ├── src/
│   │   ├── components/     # Header, SearchBar, ProductCard, AdminPanel
│   │   ├── pages/          # SearchPage
│   │   └── utils/          # API calls (axios)
│   └── Dockerfile
├── backend/                # Node.js + Express API
│   ├── config/             # DynamoDB, S3, Logger config
│   ├── routes/             # products.js, upload.js, health.js
│   ├── utils/              # seedData.js, createTable.js
│   └── Dockerfile
├── nginx/                  # Reverse proxy config
│   ├── nginx.conf
│   └── Dockerfile
├── .github/workflows/      # CI/CD pipeline
│   └── deploy.yml
└── docker-compose.yml
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 |
| Backend | Node.js + Express.js |
| Database | AWS DynamoDB |
| Storage | AWS S3 |
| Hosting | AWS EC2 |
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Monitoring | AWS CloudWatch + Winston |
| Alerts | AWS SNS (optional) |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS Account (free tier works)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/price-compare-app.git
cd price-compare-app
```

### Step 2: Set Up AWS Resources

#### A) Create DynamoDB Table
Go to AWS Console → DynamoDB → Create Table:
- **Table name:** `Products`
- **Partition key:** `productId` (String)
- **Billing mode:** On-demand (Pay per request)
- Click **Create table**

#### B) Create S3 Bucket
Go to AWS Console → S3 → Create Bucket:
- **Bucket name:** `pricecomparehub-images` (must be globally unique)
- **Region:** `ap-south-1` (or your preferred region)
- Uncheck "Block all public access" (for image hosting)
- Click **Create bucket**

#### C) Create IAM User (for local dev)
Go to AWS Console → IAM → Users → Create User:
- **Username:** `pricecomparehub-dev`
- **Permissions:** Attach policies:
  - `AmazonDynamoDBFullAccess`
  - `AmazonS3FullAccess`
  - `CloudWatchLogsFullAccess`
  - `AmazonSNSFullAccess` (optional)
- Go to **Security credentials** → Create **Access key**
- Save `Access Key ID` and `Secret Access Key`

### Step 3: Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DYNAMODB_TABLE_NAME=Products
S3_BUCKET_NAME=pricecomparehub-images
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Frontend
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Create DynamoDB Table Programmatically

```bash
cd backend
npm install
node utils/createTable.js
```

Expected output:
```
✅ Table "Products" created successfully!
```

### Step 5: Seed Sample Data

```bash
node utils/seedData.js
```

Expected output:
```
🌱 Seeding sample products into DynamoDB...

  ✅ AMAZON - Nike Air Max 270
  ✅ FLIPKART - Nike Air Max 270
  ✅ MYNTRA - Nike Air Max 270
  ✅ AMAZON - Apple MacBook Air M2
  ...

🎉 Seeded 15/15 products!
```

### Step 6: Run with Docker Compose

```bash
# From project root
cd ..

# Copy backend .env to project root for docker-compose
cp backend/.env .env

# Build and start all services
docker-compose up --build
```

Visit: **http://localhost**

---

## 🔍 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/products/search?q=shoes` | Search products |
| `GET` | `/api/products/search?q=shoes&platform=amazon` | Filter by platform |
| `GET` | `/api/products/search?q=shoes&sort=price_asc` | Sort results |
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create product (Admin) |
| `PUT` | `/api/products/:id` | Update product (Admin) |
| `DELETE` | `/api/products/:id` | Delete product (Admin) |
| `POST` | `/api/upload/presigned-url` | S3 upload URL |

### Search Query Parameters

| Param | Values | Description |
|-------|--------|-------------|
| `q` | any string | Search term (required) |
| `platform` | `all`, `amazon`, `flipkart`, `myntra` | Filter by platform |
| `sort` | `price_asc`, `price_desc`, `rating` | Sort order |
| `category` | `shoes`, `phones`, `laptops`, etc. | Filter by category |

### Example API Calls

```bash
# Search for shoes (lowest price first)
curl "http://localhost/api/products/search?q=shoes"

# Search Amazon only, highest price first
curl "http://localhost/api/products/search?q=laptop&platform=amazon&sort=price_desc"

# Add a product
curl -X POST http://localhost/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "platform": "amazon",
    "price": 79900,
    "originalPrice": 89900,
    "category": "phones",
    "brand": "Apple",
    "rating": 4.6,
    "reviewCount": 5000,
    "delivery": "Free delivery by Tomorrow",
    "productUrl": "https://amazon.in",
    "imageUrl": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400"
  }'

# Delete a product
curl -X DELETE http://localhost/api/products/PRODUCT_ID_HERE
```

---

## ☁️ AWS EC2 Deployment

### Step 1: Launch EC2 Instance
- **AMI:** Amazon Linux 2023 (free tier)
- **Instance type:** t2.micro (free tier)
- **Security Group:** Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **Key pair:** Create and download `.pem` file

### Step 2: Create IAM Role for EC2
Go to IAM → Roles → Create Role:
- **Trusted entity:** EC2
- **Policies:**
  - `AmazonDynamoDBFullAccess`
  - `AmazonS3FullAccess`
  - `CloudWatchLogsFullAccess`
  - `AmazonSNSFullAccess` (optional)
- **Role name:** `PriceCompareHubEC2Role`

Attach role to EC2:
- EC2 Console → Select instance → Actions → Security → Modify IAM Role → Select `PriceCompareHubEC2Role`

### Step 3: Connect to EC2 & Install Dependencies

```bash
# Connect to EC2
ssh -i "your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP

# Update system
sudo yum update -y

# Install Git
sudo yum install git -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group change to take effect
exit
ssh -i "your-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP

# Verify installations
docker --version
docker-compose --version
```

### Step 4: Clone & Configure on EC2

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/price-compare-app.git
cd price-compare-app

# Create .env file (on EC2 with IAM Role, no AWS keys needed)
cat > .env << EOF
AWS_REGION=ap-south-1
DYNAMODB_TABLE_NAME=Products
S3_BUCKET_NAME=pricecomparehub-images
NODE_ENV=production
PORT=5000
EOF
```

### Step 5: Build and Run

```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 6: Seed Data on EC2

```bash
# Run seed script inside backend container
docker-compose exec backend node utils/createTable.js
docker-compose exec backend node utils/seedData.js
```

### Step 7: Open in Browser

Visit: `http://YOUR_EC2_PUBLIC_IP`

---

## 🔄 GitHub Actions CI/CD Setup

### Add GitHub Secrets
Go to GitHub → Your Repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret key |
| `AWS_REGION` | `ap-south-1` |
| `EC2_HOST` | Your EC2 public IP |
| `EC2_SSH_KEY` | Contents of your `.pem` file |

### Pipeline Flow
```
Push to main
    ↓
Run Tests (node --check)
    ↓
Build Docker Images
    ↓
Push to Amazon ECR
    ↓
SSH into EC2
    ↓
git pull + docker-compose up
    ↓
✅ Live!
```

---

## 📊 AWS CloudWatch Monitoring

Logs are automatically sent to CloudWatch in production under:
- **Log Group:** `/pricecomparehub/backend`
- **Log Stream:** `backend-YYYY-MM-DD`

To view logs:
```bash
# Via AWS CLI
aws logs tail /pricecomparehub/backend --follow

# Or via AWS Console
# CloudWatch → Log groups → /pricecomparehub/backend
```

---

## 🔔 SNS Price Drop Alerts (Optional)

### Setup SNS Topic
```bash
# Create SNS topic
aws sns create-topic --name PriceDropAlerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:ACCOUNT_ID:PriceDropAlerts \
  --protocol email \
  --notification-endpoint your@email.com
```

Add to `.env`:
```env
SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:ACCOUNT_ID:PriceDropAlerts
```

Alerts trigger automatically when you update a product's price to a lower value via the Admin panel.

---

## 🐳 Useful Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Execute command in container
docker-compose exec backend node utils/seedData.js

# Remove all containers and volumes
docker-compose down -v

# Check resource usage
docker stats
```

---

## 📦 DynamoDB Table Schema

**Table Name:** `Products`

| Field | Type | Description |
|-------|------|-------------|
| `productId` | String (PK) | UUID - unique identifier |
| `name` | String | Product name |
| `platform` | String | `amazon` / `flipkart` / `myntra` |
| `price` | Number | Current price in INR |
| `originalPrice` | Number | MRP / original price |
| `imageUrl` | String | Product image URL |
| `rating` | Number | Rating (0-5) |
| `reviewCount` | Number | Number of reviews |
| `delivery` | String | Delivery information |
| `productUrl` | String | Buy Now link |
| `category` | String | Product category |
| `brand` | String | Brand name |
| `createdAt` | String | ISO timestamp |
| `updatedAt` | String | ISO timestamp |

---

## 🛣️ Roadmap

- [ ] Add official Amazon/Flipkart affiliate APIs
- [ ] User authentication (AWS Cognito)
- [ ] Price history charts (DynamoDB Streams)
- [ ] Email alerts on signup (SNS + SES)
- [ ] Kubernetes deployment (EKS)
- [ ] Redis caching layer
- [ ] Product image upload to S3

---

## 📄 License

MIT — Build freely!
