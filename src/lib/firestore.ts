import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  WhereFilterOp,
} from "firebase/firestore";
import { db } from "./firebase";

/* ═══════════════════════════════════════════════════════
   TYPES — Data Schema
   ═══════════════════════════════════════════════════════ */

export interface Client {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  sku: string;
  unit: string;
  price: number;
  category: string;
  stock: number;
  isService: boolean;
  hsnCode: string;
  taxRate: number;
  imageUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CustomField {
  label: string;
  value: string;
}

export interface LineItem {
  productId?: string;
  name: string;
  description: string;
  unit: string;
  hsnCode: string;
  qty: number;
  rate: number;
  tax: number;
  isService: boolean;
  customFields: CustomField[];
}

export interface TermItem {
  text: string;
}

export interface Attachment {
  url: string;
  name: string;
  size: number;
  type: string;
}

export type EstimateStatus = "draft" | "sent" | "accepted" | "rejected" | "converted";

export interface Estimate {
  id?: string;
  estimateNumber: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  status: EstimateStatus;
  date: string;
  validUntil: string;
  headerNote: string;
  items: LineItem[];
  terms: TermItem[];
  customFields: CustomField[];
  discountType: "%" | "fixed";
  discountValue: number;
  taxEnabled: boolean;
  taxType: "%" | "fixed";
  taxValue: number;
  subtotal: number;
  discountAmt: number;
  taxAmt: number;
  total: number;
  attachments: Attachment[];
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type InvoiceStatus = "draft" | "sent" | "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  estimateId?: string;
  clientId: string;
  clientName: string;
  clientCompany?: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paymentRef?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface QuoteRequest {
  id?: string;
  clientName: string;
  email: string;
  phone: string;
  projectName: string;
  zones: { name: string; modules: string[] }[];
  total: number;
  status: "pending" | "reviewed" | "converted";
  createdAt?: Timestamp;
}

/* ═══════════════════════════════════════════════════════
   GENERIC CRUD FUNCTIONS
   ═══════════════════════════════════════════════════════ */

// Create
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Read one
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collectionName, docId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

// Read many with filters
export async function getDocuments<T>(
  collectionName: string,
  filters?: { field: string; op: WhereFilterOp; value: unknown }[],
  sortBy?: { field: string; direction: "asc" | "desc" },
  maxResults?: number
): Promise<(T & { id: string })[]> {
  const constraints: QueryConstraint[] = [];

  if (filters) {
    for (const f of filters) {
      constraints.push(where(f.field, f.op, f.value));
    }
  }
  if (sortBy) {
    constraints.push(orderBy(sortBy.field, sortBy.direction));
  }
  if (maxResults) {
    constraints.push(limit(maxResults));
  }

  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
}

// Update
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

/* ═══════════════════════════════════════════════════════
   COLLECTION NAMES (centralized)
   ═══════════════════════════════════════════════════════ */
export const COLLECTIONS = {
  CLIENTS: "clients",
  PRODUCTS: "products",
  ESTIMATES: "estimates",
  INVOICES: "invoices",
  QUOTES: "quotes",
  USERS: "users",
  SOCIAL_POSTS: "social_posts",
  SOCIAL_CAMPAIGNS: "social_campaigns",
  SOCIAL_ACCOUNTS: "social_accounts",
} as const;

/* ═══════════════════════════════════════════════════════
   SOCIAL MEDIA TYPES
   ═══════════════════════════════════════════════════════ */

export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "whatsapp" | "tiktok" | "x" | "email";
export type PostStatus = "draft" | "scheduled" | "published" | "failed";

export interface SocialAccount {
  id?: string;
  platform: SocialPlatform;
  accountName: string;
  displayName: string;
  profileUrl: string;
  followers: number;
  following: number;
  isConnected: boolean;
  accessToken?: string;
  lastSynced?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SocialPost {
  id?: string;
  content: string;
  platforms: SocialPlatform[];
  mediaUrls: string[];
  scheduledAt?: string;
  publishedAt?: string;
  status: PostStatus;
  hashtags: string[];
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  };
  campaignId?: string;
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SocialCampaign {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "completed" | "paused";
  platforms: SocialPlatform[];
  budget: number;
  spent: number;
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    leads: number;
  };
  postIds: string[];
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/* ═══════════════════════════════════════════════════════
   SPECIALIZED HELPERS
   ═══════════════════════════════════════════════════════ */

// Get next sequential number (EST-001, FAC-2024-001)
export async function getNextNumber(
  collectionName: string,
  prefix: string,
  fieldName: string = "estimateNumber"
): Promise<string> {
  const docs = await getDocuments<DocumentData>(
    collectionName,
    undefined,
    { field: "createdAt", direction: "desc" },
    1
  );

  if (docs.length === 0) return `${prefix}001`;

  const lastNum = docs[0][fieldName] as string;
  const numPart = lastNum.replace(/\D/g, "");
  const next = (parseInt(numPart) || 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// Get today's documents count
export async function getTodayCount(collectionName: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);

  const docs = await getDocuments<DocumentData>(collectionName, [
    { field: "createdAt", op: ">=", value: startOfDay },
  ]);

  return docs.length;
}
