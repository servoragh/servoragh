# Servora — Relational Database Schema & Data Models

## 1. ERD Overview & Entities
Servora utilizes a normalized relational schema designed with foreign keys, indexes, and cascades.

### Key Entities:
1. `User` (Authentication, Role, Contact info)
2. `Profile` (Customer/Provider extended info)
3. `ProviderProfile` (Business details, pricing, experience, verification status, trust score)
4. `Category` & `SubCategory` (Hierarchical service categories)
5. `Location` (Country -> Region -> City -> Area/Neighborhood)
6. `ServiceRequest` (Job postings by customers)
7. `Quote` (Bids/Estimates from providers)
8. `Conversation` & `Message` (Direct chat threads)
9. `Review` (Ratings & feedback)
10. `VerificationRequest` & `AuditLog` (Admin verification workflows & security logs)
11. `Referral` (Referral code tracking)
12. `Notification` (In-app alerts)
13. `FeatureFlag` (Monetization & experimental toggles)

---

## 2. Prisma Schema Definition

```prisma
datasource db {
  provider = "sqlite" // Easily changed to "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}

enum RequestStatus {
  OPEN
  QUOTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
  REJECTED
}

model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  phone         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(CUSTOMER)
  avatarUrl     String?
  isPhoneVerified Boolean @default(false)
  referralCode  String    @unique
  referredByCode String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  providerProfile       ProviderProfile?
  serviceRequests       ServiceRequest[]     @relation("CustomerRequests")
  quotes                Quote[]              @relation("ProviderQuotes")
  reviewsGiven          Review[]             @relation("AuthorReviews")
  reviewsReceived       Review[]             @relation("TargetReviews")
  sentMessages          Message[]            @relation("SentMessages")
  notifications         Notification[]
  reportsSubmitted      Report[]             @relation("ReportedBy")
  reportsAgainst        Report[]             @relation("ReportedTarget")
  verificationRequests  VerificationRequest[]
  auditLogs             AuditLog[]           @relation("UserAuditLogs")
}

model ProviderProfile {
  id                String             @id @default(uuid())
  userId            String             @unique
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  businessName      String
  slug              String             @unique
  bio               String
  yearsExperience   Int                @default(1)
  pricingHourly     Float?
  pricingFixedStart Float?
  serviceArea       String             // JSON string or comma-separated areas
  verificationStatus VerificationStatus @default(UNVERIFIED)
  idDocumentUrl     String?
  businessCertUrl   String?
  portfolioUrls     String             // JSON array string
  ratingAverage     Float              @default(0.0)
  reviewCount       Int                @default(0)
  completedJobsCount Int               @default(0)
  responseRate      Float              @default(100.0)
  responseTimeMinutes Int              @default(30)
  isPromoted        Boolean            @default(false)
  badges            String             // JSON string array e.g. ["PHONE_VERIFIED","IDENTITY_VERIFIED"]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  services          ProviderService[]
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  description String
  icon        String
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())

  services    Service[]
}

model Service {
  id          String   @id @default(uuid())
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name        String
  slug        String   @unique
  description String
  createdAt   DateTime @default(now())

  providers   ProviderService[]
  requests    ServiceRequest[]
}

model ProviderService {
  id          String          @id @default(uuid())
  providerId  String
  provider    ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade)
  serviceId   String
  service     Service         @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([providerId, serviceId])
}

model Location {
  id        String   @id @default(uuid())
  country   String   @default("Ghana")
  region    String   @default("Northern Region")
  city      String   @default("Tamale")
  area      String   // e.g. Sakasaka, Choggu, Nyohini
  slug      String   @unique
  createdAt DateTime @default(now())

  requests  ServiceRequest[]
}

model ServiceRequest {
  id          String        @id @default(uuid())
  customerId  String
  customer    User          @relation("CustomerRequests", fields: [customerId], references: [id], onDelete: Cascade)
  serviceId   String
  service     Service       @relation(fields: [serviceId], references: [id])
  locationId  String
  location    Location      @relation(fields: [locationId], references: [id])
  title       String
  description String
  images      String        // JSON array string
  urgency     String        // TODAY, THIS_WEEK, FLEXIBLE
  budgetMin   Float?
  budgetMax   Float?
  status      RequestStatus @default(OPEN)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  quotes      Quote[]
  reviews     Review[]
}

model Quote {
  id               String      @id @default(uuid())
  requestId        String
  request          ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  providerId       String
  provider         User        @relation("ProviderQuotes", fields: [providerId], references: [id], onDelete: Cascade)
  price            Float
  estimatedHours   Int?
  completionTime   String
  message          String
  status           QuoteStatus @default(PENDING)
  createdAt        DateTime    @default(now())

  conversation     Conversation?
}

model Conversation {
  id        String   @id @default(uuid())
  quoteId   String?  @unique
  quote     Quote?   @relation(fields: [quoteId], references: [id], onDelete: SetNull)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  messages  Message[]
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation("SentMessages", fields: [senderId], references: [id])
  text           String
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())
}

model Review {
  id          String   @id @default(uuid())
  requestId   String
  request     ServiceRequest @relation(fields: [requestId], references: [id])
  authorId    String
  author      User     @relation("AuthorReviews", fields: [authorId], references: [id])
  targetId    String
  target      User     @relation("TargetReviews", fields: [targetId], references: [id])
  rating      Int      // 1 to 5
  comment     String
  isApproved  Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model VerificationRequest {
  id          String             @id @default(uuid())
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  idType      String             // Ghana Card, Driver License, Passport
  idNumber    String
  documentUrl String
  status      VerificationStatus @default(PENDING)
  adminNotes  String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model Report {
  id          String   @id @default(uuid())
  reporterId  String
  reporter    User     @relation("ReportedBy", fields: [reporterId], references: [id])
  targetId    String?
  target      User?    @relation("ReportedTarget", fields: [targetId], references: [id])
  reason      String
  details     String
  isResolved  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model FeatureFlag {
  id          String   @id @default(uuid())
  name        String   @unique // e.g. commission_enabled, provider_subscription_enabled
  isEnabled   Boolean  @default(false)
  description String
  updatedAt   DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation("UserAuditLogs", fields: [userId], references: [id])
  action    String   // e.g. VERIFY_PROVIDER, DELETE_REVIEW
  details   String
  ipAddress String?
  createdAt DateTime @default(now())
}
```
