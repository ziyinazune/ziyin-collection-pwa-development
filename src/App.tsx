import { useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isBefore,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Camera, Plus, Search, Grid3X3, Calendar as CalendarIcon, PieChart as PieIcon, SlidersHorizontal, X, Trash2, Tag as TagIcon, Clock, TrendingUp, PiggyBank, Check, ChevronLeft, ChevronRight, Download, Upload, Sparkles, BookOpen, Gamepad2, Laptop, ShoppingBag, Heart, Layers, Timer, BadgePercent, Image as ImageIcon, MoreVertical, RotateCw,
} from "lucide-react";

type CollectionItem = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  image?: string;
  originalPrice: number;
  purchasePrice: number;
  quantity: number;
  purchaseDate: string;
  source?: string;
  location?: string;
  notes?: string;
  expiryDate?: string;
  isFree: boolean;
  courseTotal?: number;
  courseCompleted?: number;
  useUsageCost?: boolean;
  usageType?: "days" | "times" | "custom";
  usageCount?: number;
  usageUnit?: string;
  rating?: number; // 评分 0-5，支持 0.5 步进
};

const DEFAULT_CATEGORIES = [
  { name: "课程", icon: BookOpen, color: "#8b5cf6" },
  { name: "游戏", icon: Gamepad2, color: "#ec4899" },
  { name: "软件", icon: Laptop, color: "#0ea5e9" },
  { name: "电子产品", icon: Layers, color: "#6366f1" },
  { name: "化妆品", icon: Sparkles, color: "#f59e0b" },
  { name: "订阅服务", icon: Timer, color: "#10b981" },
  { name: "图书", icon: BookOpen, color: "#8b5cf6" },
  { name: "其他", icon: ShoppingBag, color: "#71717a" },
];

const EXAMPLE_ITEMS: CollectionItem[] = [
  {
    id: "c1",
    name: "Notion 高效训练营",
    category: "课程",
    tags: ["白嫖", "生产力", "B站"],
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
    originalPrice: 299,
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: "2024-11-15",
    source: "B站限免",
    notes: "20节·体系化学习，已完成12节",
    isFree: true,
    courseTotal: 20,
    courseCompleted: 12,
    rating: 4.5,
  },
  {
    id: "c2",
    name: "Hades 完整版",
    category: "游戏",
    tags: ["Epic限免", "Roguelike"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    originalPrice: 80,
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: "2025-01-08",
    source: "Epic Games",
    notes: "年度神作，白嫖快乐",
    isFree: true,
    rating: 5,
  },
  {
    id: "c3",
    name: "Photoshop 2024 年度订阅",
    category: "软件",
    tags: ["设计", "订阅"],
    image: "https://images.unsplash.com/photo-1611162616305-c69af83b38b8?w=800&q=80",
    originalPrice: 888,
    purchasePrice: 598,
    quantity: 1,
    purchaseDate: "2024-12-01",
    source: "Adobe官网 学生优惠",
    expiryDate: "2025-12-01",
    notes: "省290",
    isFree: false,
    rating: 4,
  },
  {
    id: "c4",
    name: "兰蔻小黑瓶 50ml",
    category: "化妆品",
    tags: ["护肤", "保质期"],
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
    originalPrice: 1080,
    purchasePrice: 760,
    quantity: 1,
    purchaseDate: "2024-09-20",
    source: "天猫旗舰店",
    location: "梳妆台",
    expiryDate: "2026-06-15",
    isFree: false,
  },
  {
    id: "c5",
    name: "AirPods Pro 2",
    category: "电子产品",
    tags: ["数码", "降噪"],
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
    originalPrice: 1899,
    purchasePrice: 1499,
    quantity: 1,
    purchaseDate: "2024-06-18",
    source: "京东618",
    location: "通勤包",
    notes: "已使用快1年",
    isFree: false,
  },
  {
    id: "c6",
    name: "前端进阶：React 19 实战",
    category: "课程",
    tags: ["付费", "编程"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    originalPrice: 1299,
    purchasePrice: 899,
    quantity: 1,
    purchaseDate: "2025-02-10",
    source: "极客时间",
    isFree: false,
    courseTotal: 36,
    courseCompleted: 36,
  },
  {
    id: "c7",
    name: "Notion AI Plus",
    category: "订阅服务",
    tags: ["AI", "月付"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    originalPrice: 96,
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: "2025-03-01",
    source: "GitHub学生包",
    expiryDate: "2025-09-01",
    notes: "白嫖6个月",
    isFree: true,
  },
  {
    id: "c8",
    name: "星之卡比：探索发现",
    category: "游戏",
    tags: ["Switch", "实体"],
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    originalPrice: 359,
    purchasePrice: 259,
    quantity: 1,
    purchaseDate: "2024-08-05",
    source: "拼多多百亿补贴",
    location: "游戏柜",
    isFree: false,
  },
  {
    id: "c9",
    name: "Figma 专业版",
    category: "软件",
    tags: ["设计", "白嫖"],
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
    originalPrice: 144,
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: "2025-04-02",
    source: "教育邮箱",
    expiryDate: "2026-04-02",
    isFree: true,
  },
];

const STORAGE_KEY = "ziyin_collection_v2";
const CATEGORY_KEY = "ziyin_categories_v2";
const DB_NAME = "ziyin_collection_db";
const DB_VERSION = 1;
const ITEMS_STORE = "items";
const META_STORE = "meta";
const META_ITEMS_KEY = "items";
const META_CATEGORIES_KEY = "categories";
const INIT_FLAG_KEY = "ziyin_collection_initialized";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        db.createObjectStore(ITEMS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getDbValue<T>(storeName: string, key: IDBValidKey) {
  const db = await openDb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getAllDbValues<T>(storeName: string) {
  const db = await openDb();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function addMultipleDbItems(items: CollectionItem[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, "readwrite");
    const store = tx.objectStore(ITEMS_STORE);
    items.forEach(item => store.add(item));

    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function operateOnDbItem(
  operation: "add" | "put" | "delete",
  itemOrId: CollectionItem | string
) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, "readwrite");
    const store = tx.objectStore(ITEMS_STORE);
    let request: IDBRequest;

    switch (operation) {
      case "add":
        request = store.add(itemOrId as CollectionItem);
        break;
      case "put":
        request = store.put(itemOrId as CollectionItem);
        break;
      case "delete":
        request = store.delete(itemOrId as string);
        break;
    }

    request.onerror = () => reject(request.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function replaceDbItems(items: CollectionItem[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, "readwrite");
    const store = tx.objectStore(ITEMS_STORE);
    const clearReq = store.clear();
    clearReq.onerror = reject;
    clearReq.onsuccess = () => {
      items.forEach(item => store.put(item));
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteDbItems(ids: string[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, "readwrite");
    const store = tx.objectStore(ITEMS_STORE);
    ids.forEach(id => store.delete(id));
    
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function setDbValue(storeName: string, value: any, key?: IDBValidKey) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = key === undefined ? store.put(value) : store.put(value, key);

    request.onerror = () => reject(request.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function getPiggyBankSaved(item: CollectionItem) {
  if (item.category === "课程" && item.courseTotal) {
    const completed = Math.min(item.courseCompleted || 0, item.courseTotal);
    const perLessonSaved = Math.max(0, item.originalPrice - item.purchasePrice) / item.courseTotal;
    return perLessonSaved * completed * item.quantity;
  }

  if (item.isFree) {
    return item.originalPrice * item.quantity;
  }

  return Math.max(0, item.originalPrice - item.purchasePrice) * item.quantity;
}

function getDailyCost(item: CollectionItem) {
  if (item.useUsageCost && (item.usageCount || 0) > 0) {
    return (item.purchasePrice * item.quantity) / (item.usageCount || 1);
  }
  const daysHeld = Math.max(1, differenceInDays(new Date(), parseISO(item.purchaseDate)));
  return (item.purchasePrice * item.quantity) / daysHeld;
}

function getUsageCostLabel(item: CollectionItem) {
  if (!item.useUsageCost || !(item.usageCount || 0)) return "";
  if (item.usageType === "days") return `按使用天数 ${item.usageCount} 天`;
  if (item.usageType === "times") return `按使用次数 ${item.usageCount} 次`;
  return `按 ${item.usageCount}${item.usageUnit || "单位"}`;
}

// 星级评分组件
function StarRating({ 
  value, 
  onChange, 
  readonly = false,
  size = "sm"
}: { 
  value?: number; 
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const stars = [];
  const displayValue = hoverValue ?? value ?? 0;
  
  const starSize = size === "sm" ? "size-4" : size === "md" ? "size-5" : "size-6";
  
  for (let i = 1; i <= 5; i++) {
    const isFull = displayValue >= i;
    const isHalf = !isFull && displayValue >= i - 0.5;
    
    stars.push(
      <div key={i} className="relative">
        {/* 空心星背景 */}
        <svg className={cn(starSize, "text-zinc-300")} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        
        {/* 实心星覆盖层 */}
        {(isFull || isHalf) && (
          <div className="absolute inset-0 overflow-hidden" style={{ width: isFull ? '100%' : '50%' }}>
            <svg className={cn(starSize, "text-amber-400")} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
        
        {/* 点击区域 - 左半部分（半星）和右半部分（整星） */}
        {!readonly && (
          <>
            <button
              type="button"
              onClick={() => onChange?.(i - 0.5)}
              onMouseEnter={() => setHoverValue(i - 0.5)}
              onMouseLeave={() => setHoverValue(null)}
              className="absolute inset-0 w-1/2 h-full cursor-pointer"
              aria-label={`${i - 0.5}星`}
            />
            <button
              type="button"
              onClick={() => onChange?.(i)}
              onMouseEnter={() => setHoverValue(i)}
              onMouseLeave={() => setHoverValue(null)}
              className="absolute inset-0 left-1/2 w-1/2 h-full cursor-pointer"
              aria-label={`${i}星`}
            />
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {stars}
    </div>
  );
}

// 可翻转的资产总览卡片组件
function AssetOverviewCard({ stats }: { stats: any }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[180px] cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={cn(
        "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
        isFlipped ? "rotate-y-180" : ""
      )}>
        {/* 正面：总价值 */}
        <div className="absolute inset-0 backface-hidden">
          <div className="h-full rounded-[28px] p-4 text-white shadow-lg overflow-hidden relative" style={{background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)"}}>
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-3 top-3 opacity-60">
              <RotateCw className="size-4" />
            </div>
            
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <p className="text-[12px] opacity-90 flex items-center gap-1">
                  <BadgePercent className="size-3.5" /> 总价值
                </p>
                <p className="mt-2 text-[36px] font-semibold tracking-tight">¥{stats.totalOriginal.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <p className="text-[10px] opacity-80">当前总日均成本</p>
                  <p className="text-[16px] font-semibold mt-0.5">¥{stats.avgDailyCost.toFixed(2)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <p className="text-[10px] opacity-80">总藏品</p>
                  <p className="text-[16px] font-semibold mt-0.5">{stats.totalItems} 件</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 背面：白嫖存钱罐和实付 */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="h-full rounded-[28px] p-4 text-white shadow-lg overflow-hidden relative" style={{background: "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)"}}>
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-3 top-3 opacity-60">
              <RotateCw className="size-4" />
            </div>
            
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <p className="text-[12px] opacity-90 flex items-center gap-1">
                  <PiggyBank className="size-3.5" /> 白嫖存钱罐
                </p>
                <p className="mt-2 text-[32px] font-semibold tracking-tight">¥{stats.freeSaved.toFixed(2)}</p>
                <p className="text-[11px] opacity-80 mt-1">累计省下的钱</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="size-3.5" />
                    <span className="text-[11px] opacity-90">实付金额</span>
                  </div>
                  <span className="text-[18px] font-semibold">¥{stats.totalPurchase.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [categories, setCategories] = useState(() => DEFAULT_CATEGORIES.map(c => c.name));
  const [tab, setTab] = useState<"home" | "calendar" | "stats" | "manage">("home");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<"new" | "price" | "free" | "expiry">("new");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dbReady, setDbReady] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      try {
        const isInitialized = localStorage.getItem(INIT_FLAG_KEY);
        
        if (!isInitialized) {
          // First time launch: seed the DB with example items
          await addMultipleDbItems(EXAMPLE_ITEMS);
          await setDbValue(META_STORE, DEFAULT_CATEGORIES.map(c => c.name), META_CATEGORIES_KEY);
          setItems(EXAMPLE_ITEMS);
          setCategories(DEFAULT_CATEGORIES.map(c => c.name));
          localStorage.setItem(INIT_FLAG_KEY, "true");
        } else {
          // Subsequent launches: load directly from DB
          const [storedItems, storedCategories] = await Promise.all([
            getAllDbValues<CollectionItem>(ITEMS_STORE),
            getDbValue<string[]>(META_STORE, META_CATEGORIES_KEY),
          ]);
          setItems(storedItems || []);
          if (storedCategories?.length) {
            setCategories(storedCategories);
          }
        }
      } catch (err) {
        console.error("Failed to initialize or load data:", err);
        // Fallback to example items in case of critical error
        setItems(EXAMPLE_ITEMS);
      } finally {
        setDbReady(true);
        setDbLoaded(true);
      }
    })();
  }, []);
  useEffect(() => {
    if (!dbReady || !dbLoaded) return;
    setDbValue(META_STORE, categories, META_CATEGORIES_KEY).catch(() => {});
  }, [categories, dbReady, dbLoaded]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(i => 
        i.name.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        i.category.includes(q) ||
        i.source?.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "全部") {
      list = list.filter(i => i.category === activeCategory);
    }
    switch (sortBy) {
      case "price":
        list.sort((a,b) => b.purchasePrice - a.purchasePrice); break;
      case "free":
        list.sort((a,b) => Number(b.isFree) - Number(a.isFree)); break;
      case "expiry":
        list.sort((a,b) => {
          const ad = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const bd = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return ad - bd;
        }); break;
      default:
        list.sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    }
    return list;
  }, [items, query, activeCategory, sortBy]);

  const stats = useMemo(() => {
    const totalOriginal = items.reduce((s,i) => s + i.originalPrice * i.quantity, 0);
    const totalPurchase = items.reduce((s,i) => s + i.purchasePrice * i.quantity, 0);
    const totalSavedDiff = totalOriginal - totalPurchase;

    const freeSaved = items.reduce((s,i) => s + getPiggyBankSaved(i), 0);

    const byCategory = categories.map(cat => {
      const list = items.filter(i => i.category === cat);
      // 使用原价计算分类价值占比
      const value = list.reduce((s,i) => s + i.originalPrice * i.quantity, 0);
      const count = list.length;
      const avg = count ? Math.round(value / count) : 0;
      return { name: cat, value, count, avg };
    }).filter(c => c.count > 0);

    const monthlyMap = new Map<string, { month: string, count: number, value: number, saved: number }>();
    items.forEach(i => {
      const m = format(parseISO(i.purchaseDate), "yyyy-MM");
      const cur = monthlyMap.get(m) || { month: m, count:0, value:0, saved:0 };
      cur.count += 1;
      cur.value += i.purchasePrice * i.quantity;
      const saved = getPiggyBankSaved(i);
      cur.saved += saved;
      monthlyMap.set(m, cur);
    });
    const monthly = Array.from(monthlyMap.values()).sort((a,b) => a.month.localeCompare(b.month)).slice(-6);

    const now = new Date();
    const expiring = items.filter(i => i.expiryDate).map(i => ({
      ...i,
      days: differenceInDays(parseISO(i.expiryDate!), now)
    })).filter(i => i.days <= 30).sort((a,b) => a.days - b.days);

    // 计算日均成本：统计当前所有无到期/保质期商品的日均成本之和
    const avgDailyCost = items.reduce((sum, i) => {
      // 有到期/保质期的商品不计入总日均成本
      if (i.expiryDate) {
        return sum;
      }

      return sum + getDailyCost(i);
    }, 0);

    return { totalOriginal, totalPurchase, totalSavedDiff, freeSaved, byCategory, monthly, expiring, avgDailyCost, totalItems: items.length };
  }, [items, categories]);

  const categoryMeta = (name: string) => DEFAULT_CATEGORIES.find(c => c.name === name) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length-1];

  const handleSave = (item: CollectionItem) => {
    const exists = items.some(p => p.id === item.id);
    if (exists) {
      setItems(prev => prev.map(p => p.id === item.id ? item : p));
      operateOnDbItem("put", item).catch(err => console.error("Failed to update item in DB", err));
    } else {
      setItems(prev => [item, ...prev]);
      operateOnDbItem("add", item).catch(err => console.error("Failed to add item to DB", err));
    }
    setShowAdd(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("确定删除该收藏？")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    operateOnDbItem("delete", id).catch(err => console.error("Failed to delete item from DB", err));
    setEditing(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `梓音收藏馆_${format(new Date(), "yyyyMMdd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = (list = items) => {
    const headers = ["名称","分类","原价","购入价","数量","购买日期","来源","是否白嫖","标签","备注"];
    const rows = list.map(i => [
      i.name, i.category, i.originalPrice, i.purchasePrice, i.quantity, i.purchaseDate, i.source||"", i.isFree?"是":"否", i.tags.join("|"), i.notes||""
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `梓音收藏馆_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_50%_-200px,#ede9fe_20%,#faf5ff_40%,#fff_70%)] text-zinc-900 antialiased selection:bg-violet-200">
      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col relative">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-violet-100/60">
          <div className="px-4 pt-3 pb-3 safe-top">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-200 grid place-items-center">
                  <Heart className="size-4.5 text-white fill-white/20" />
                </div>
                <div>
                  <h1 className="text-[17px] font-semibold tracking-tight leading-5">梓音收藏馆</h1>
                  <p className="text-[11px] text-zinc-500 -mt-0.5">收藏万物 · 记录价值</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setBatchMode(!batchMode)} className={cn("p-2 rounded-xl transition", batchMode ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}>
                  <SlidersHorizontal className="size-4" />
                </button>
                <button onClick={() => setTab("manage")} className="p-2 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                  <MoreVertical className="size-4" />
                </button>
              </div>
            </div>

            {tab === "home" && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    value={query}
                    onChange={e=>setQuery(e.target.value)}
                    placeholder="搜索名称、标签、来源…"
                    className="w-full h-10 pl-9 pr-3 rounded-2xl bg-zinc-100/80 border border-zinc-200 text-[14px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
                <button onClick={()=>setShowAdd(true)} className="h-10 px-3 rounded-2xl bg-violet-600 text-white text-[13px] font-medium shadow-md shadow-violet-200 active:scale-[0.98] flex items-center gap-1">
                  <Plus className="size-4" /> 录入
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-3.5 pb-28">
          {/* HOME */}
          {tab === "home" && (
            <div className="pt-3">
              {/* Category chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {["全部", ...categories].map(cat => {
                  const active = activeCategory === cat;
                  const meta = categoryMeta(cat);
                  const Icon = meta.icon;
                  return (
                    <button
                      key={cat}
                      onClick={()=>setActiveCategory(cat)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-8 rounded-full border text-[12.5px] whitespace-nowrap transition",
                        active ? "bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      {cat !== "全部" && <Icon className="size-3.5" style={{color: active ? "white" : meta.color}} />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort & stats mini */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-zinc-600">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200">共 {filtered.length} 件</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 flex items-center gap-1">
                    <PiggyBank className="size-3.5 text-pink-500" /> 白嫖 ¥{Math.round(stats.freeSaved).toLocaleString()}
                  </span>
                </div>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="h-7 px-2 rounded-lg bg-white border border-zinc-200 text-[12px]">
                  <option value="new">最新</option>
                  <option value="price">价格高</option>
                  <option value="free">白嫖优先</option>
                  <option value="expiry">临期优先</option>
                </select>
              </div>

              {/* Grid */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                {filtered.map(item => {
                  const meta = categoryMeta(item.category);
                  const days = differenceInDays(new Date(), parseISO(item.purchaseDate));
                  const daily = getDailyCost(item);
                  const usageLabel = getUsageCostLabel(item);
                  const isExpiring = item.expiryDate && differenceInDays(parseISO(item.expiryDate), new Date()) <= 30;
                  const isExpired = item.expiryDate && isBefore(parseISO(item.expiryDate), new Date());
                  const progress = item.category==="课程" && item.courseTotal ? Math.round(((item.courseCompleted||0)/item.courseTotal)*100) : 0;
                  const itemSaved = getPiggyBankSaved(item);
                  const selected = selectedIds.includes(item.id);
                  return (
                    <div key={item.id} className={cn("group relative bg-white rounded-[22px] border overflow-hidden shadow-sm hover:shadow-md transition", selected ? "ring-2 ring-violet-500" : "border-zinc-100")}>
                      {batchMode && (
                        <button onClick={()=>toggleSelect(item.id)} className="absolute left-2 top-2 z-10 size-6 rounded-full bg-white/90 backdrop-blur grid place-items-center border border-zinc-200">
                          <div className={cn("size-3.5 rounded-full border-2", selected ? "bg-violet-600 border-violet-600" : "border-zinc-300")} />
                        </button>
                      )}
                      <button onClick={()=> batchMode ? toggleSelect(item.id) : setEditing(item)} className="w-full text-left">
                        <div className="relative aspect-[4/3] bg-zinc-50 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-zinc-300">
                              <ImageIcon className="size-8" />
                            </div>
                          )}
                          <div className="absolute left-2 top-2 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow" style={{background: meta.color}}>{item.category}</span>
                            {item.isFree && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500 text-white shadow">白嫖</span>}
                          </div>
                          {(isExpiring || isExpired) && (
                            <span className={cn("absolute right-2 top-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white", isExpired ? "bg-red-500" : "bg-amber-500")}>
                              {isExpired ? "已过期" : "临期"}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <h3 className="text-[13.5px] font-medium leading-snug line-clamp-1">{item.name}</h3>
                          
                          {/* 评分显示 */}
                          {item.rating && item.rating > 0 ? (
                            <div className="mt-1.5">
                              <StarRating value={item.rating} readonly size="sm" />
                            </div>
                          ) : null}
                          
                          <div className="mt-1.5 flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                              {item.isFree ? (
                                <>
                                  <span className="text-[11px] text-pink-600">省</span>
                                  <span className="text-[16px] font-semibold text-pink-600">¥{Math.round(itemSaved)}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[11px] text-zinc-500">¥</span>
                                  <span className="text-[16px] font-semibold tracking-tight">{item.purchasePrice}</span>
                                  {item.originalPrice > item.purchasePrice && (
                                    <span className="text-[11px] line-through text-zinc-400 ml-1">¥{item.originalPrice}</span>
                                  )}
                                </>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">{format(parseISO(item.purchaseDate),"MM/dd")}</span>
                          </div>
                          {item.category==="课程" && item.courseTotal ? (
                            <div className="mt-2">
                              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{width: `${progress}%`}} />
                              </div>
                              <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                                <span>进度 {item.courseCompleted}/{item.courseTotal}</span>
                                <span>已存 ¥{Math.round(itemSaved)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                              <span>{usageLabel || `持有 ${days}天`}</span>
                              <span>日均 ¥{daily.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>

              {filtered.length === 0 && (
                <div className="mt-16 text-center">
                  <div className="mx-auto size-14 rounded-2xl bg-violet-100 grid place-items-center text-violet-600">
                    <Grid3X3 className="size-7" />
                  </div>
                  <p className="mt-3 text-[14px] font-medium">还没有收藏</p>
                  <p className="text-[12px] text-zinc-500 mt-1">点击右下角 + 快速录入第一件宝贝</p>
                </div>
              )}

              {batchMode && selectedIds.length > 0 && (
                <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 z-30">
                  <div className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-zinc-900 text-white shadow-xl">
                    <span className="text-[12px]">已选 {selectedIds.length}</span>
                    <div className="w-px h-5 bg-white/20" />
                    <button onClick={()=>{
                      if (!confirm(`删除 ${selectedIds.length} 项？`)) return;
                      deleteDbItems(selectedIds).catch(err => console.error("Failed to batch delete from DB", err));
                      setItems(prev=>prev.filter(i=>!selectedIds.includes(i.id)));
                      setSelectedIds([]); setBatchMode(false);
                    }} className="flex items-center gap-1 text-[12px] px-2 h-7 rounded-lg bg-red-500">
                      <Trash2 className="size-3.5" /> 删除
                    </button>
                    <button onClick={()=>exportCSV(items.filter(i=>selectedIds.includes(i.id)))} className="flex items-center gap-1 text-[12px] px-2 h-7 rounded-lg bg-white/15">
                      <Download className="size-3.5" /> 导出
                    </button>
                    <button onClick={()=>{setSelectedIds([]); setBatchMode(false);}} className="p-1">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CALENDAR */}
          {tab === "calendar" && (
            <div className="pt-3">
              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <button onClick={()=>setSelectedDate(subMonths(selectedDate,1))} className="p-2 rounded-xl hover:bg-zinc-100"><ChevronLeft className="size-4" /></button>
                  <h2 className="text-[15px] font-semibold">{format(selectedDate,"yyyy年 MM月",{locale:zhCN})}</h2>
                  <button onClick={()=>setSelectedDate(addMonths(selectedDate,1))} className="p-2 rounded-xl hover:bg-zinc-100"><ChevronRight className="size-4" /></button>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
                  {["日","一","二","三","四","五","六"].map(d=><div key={d} className="h-6 grid place-items-center">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({start: startOfMonth(selectedDate), end: endOfMonth(selectedDate)}).map(day=>{
                    const firstDay = startOfMonth(selectedDate).getDay();
                    const offset = day.getDate() === 1 ? firstDay : 0;
                    const itemsOnDay = items.filter(i => isSameDay(parseISO(i.purchaseDate), day));
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                      <div key={day.toISOString()} style={offset?{gridColumnStart: offset+1}:undefined}>
                        <button onClick={()=>setSelectedDate(day)} className={cn("w-full aspect-square rounded-2xl flex flex-col items-center justify-center relative transition", isSelected ? "bg-violet-600 text-white" : isToday ? "bg-violet-50 text-violet-700" : "hover:bg-zinc-50")}>
                          <span className="text-[13px] font-medium">{format(day,"d")}</span>
                          {itemsOnDay.length>0 && (
                            <span className={cn("mt-0.5 w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-violet-500")} />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium flex items-center gap-1.5"><Clock className="size-4 text-violet-600" /> {format(selectedDate,"MM月dd日",{locale:zhCN})} 的收藏</h3>
                <div className="mt-2 space-y-2">
                  {items.filter(i=>isSameDay(parseISO(i.purchaseDate), selectedDate)).map(i=>(
                    <button key={i.id} onClick={()=>setEditing(i)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 text-left">
                      <img src={i.image} className="size-11 rounded-xl object-cover bg-zinc-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{i.name}</p>
                        <p className="text-[11px] text-zinc-500">{i.category} · {i.isFree ? `存钱罐+¥${Math.round(getPiggyBankSaved(i))}` : `¥${i.purchasePrice}`}</p>
                      </div>
                      <ChevronRight className="size-4 text-zinc-400" />
                    </button>
                  ))}
                  {items.filter(i=>isSameDay(parseISO(i.purchaseDate), selectedDate)).length===0 && (
                    <p className="text-[12px] text-zinc-500 py-6 text-center">这一天还没有记录</p>
                  )}
                </div>
              </div>

              <div className="mt-3 bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium flex items-center gap-1.5"><TrendingUp className="size-4 text-violet-600" /> 时光轨迹</h3>
                <div className="mt-3 relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-px bg-zinc-200" />
                  <div className="space-y-4">
                    {[...items].sort((a,b)=>+new Date(b.purchaseDate)-+new Date(a.purchaseDate)).slice(0,12).map(i=>(
                      <div key={i.id} className="relative pl-10">
                        <div className="absolute left-[12px] top-1 size-[14px] rounded-full bg-white border-2 border-violet-500" />
                        <p className="text-[11px] text-zinc-500">{format(parseISO(i.purchaseDate),"yyyy-MM-dd")}</p>
                        <p className="text-[13px] font-medium">{i.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATS */}
          {tab === "stats" && (
            <div className="pt-3 space-y-3">
              {/* 资产总览 - 可翻转卡片 */}
              <AssetOverviewCard stats={stats} />

              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium">分类价值占比</h3>
                <div className="h-[200px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} cornerRadius={8}>
                        {stats.byCategory.map((entry, index) => {
                          const meta = categoryMeta(entry.name);
                          return <Cell key={index} fill={meta.color} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(v:any)=>`¥${Number(v).toLocaleString()}`} contentStyle={{borderRadius:12, border:"1px solid #e4e4e7", fontSize:12}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {stats.byCategory.map(c=>{
                    const meta = categoryMeta(c.name);
                    return (
                      <div key={c.name} className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{background:meta.color}} />{c.name}</div>
                        <span className="text-zinc-500">{c.count}件 · ¥{c.value}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium">月度新增趋势</h3>
                <div className="h-[180px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthly} margin={{left:-20,right:10,top:10,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{fontSize:11}} tickFormatter={v=>v.slice(5)} />
                      <YAxis tick={{fontSize:11}} />
                      <Tooltip contentStyle={{borderRadius:12, border:"1px solid #e4e4e7", fontSize:12}} />
                      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} dot={{r:3}} name="花费" />
                      <Line type="monotone" dataKey="saved" stroke="#ec4899" strokeWidth={2.5} dot={{r:3}} name="白嫖省" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium flex items-center gap-1.5"><Clock className="size-4 text-amber-500" /> 过期提醒</h3>
                <div className="mt-2 space-y-2">
                  {stats.expiring.length===0 && <p className="text-[12px] text-zinc-500 py-4 text-center">暂无临期物品</p>}
                  {stats.expiring.map(i=>(
                    <div key={i.id} className="flex items-center gap-3 p-2 rounded-xl bg-amber-50 border border-amber-100">
                      <img src={i.image} className="size-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{i.name}</p>
                        <p className="text-[11px] text-amber-700">{i.days<0 ? `已过期 ${Math.abs(i.days)}天` : `${i.days}天后到期`} · {format(parseISO(i.expiryDate!),"yyyy-MM-dd")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MANAGE */}
          {tab === "manage" && (
            <div className="pt-3 space-y-3">
              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium">分类管理</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map(cat=>{
                    const meta = categoryMeta(cat);
                    const count = items.filter(i=>i.category===cat).length;
                    return (
                      <div key={cat} className="px-3 h-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center gap-1.5 text-[12px]">
                        <span className="size-2 rounded-full" style={{background:meta.color}} />
                        {cat} <span className="text-zinc-500">({count})</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input id="newcat" placeholder="新增分类名称" className="flex-1 h-9 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px]" />
                  <button onClick={()=>{
                    const el = document.getElementById("newcat") as HTMLInputElement;
                    const v = el.value.trim();
                    if (v && !categories.includes(v)) { setCategories([...categories, v]); el.value=""; }
                  }} className="h-9 px-3 rounded-xl bg-violet-600 text-white text-[13px]">添加</button>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium">数据备份</h3>
                <p className="text-[12px] text-zinc-500 mt-1">本地优先 · 支持导出 JSON / CSV</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={exportJSON} className="h-10 rounded-xl bg-zinc-900 text-white text-[13px] flex items-center justify-center gap-1.5"><Download className="size-4" /> 导出JSON</button>
                  <button onClick={()=>exportCSV()} className="h-10 rounded-xl bg-zinc-100 text-zinc-900 text-[13px] flex items-center justify-center gap-1.5"><Download className="size-4" /> 导出CSV</button>
                  <label className="h-10 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 text-[13px] flex items-center justify-center gap-1.5 cursor-pointer col-span-2">
                    <Upload className="size-4" /> 导入JSON
                    <input type="file" accept="application/json" className="hidden" onChange={async e=>{
                      const f = e.target.files?.[0]; if(!f) return;
                      const txt = await f.text();
                      try { 
                        const data = JSON.parse(txt); 
                        if(Array.isArray(data)){ 
                          await replaceDbItems(data); // Persist to DB
                          setItems(data); // Update UI
                          localStorage.setItem(INIT_FLAG_KEY, "true"); // Set init flag
                          alert("导入成功");
                        } else {
                          alert("导入失败：JSON文件格式不正确");
                        }
                      } catch { 
                        alert("导入失败：无法解析文件");
                      }
                      e.target.value = ""; // Reset file input
                    }} />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-3">
                <h3 className="text-[14px] font-medium">关于</h3>
                <p className="text-[12px] text-zinc-600 mt-1 leading-relaxed">
                  梓音收藏馆 · 移动端PWA设计，专注收藏整理与价值统计。长期主义，记录每一次「白嫖」的快乐。
                </p>
                <div className="mt-2 text-[11px] text-zinc-500">数据仅保存在本机浏览器 · v2.0</div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 inset-x-0 z-30">
          <div className="mx-auto max-w-[480px] px-3 pb-3 safe-bottom">
            <div className="h-[64px] rounded-[24px] bg-white/80 backdrop-blur-2xl border border-zinc-200 shadow-xl shadow-zinc-200/50 flex items-center justify-around">
              {[
                {k:"home",label:"展柜",icon:Grid3X3},
                {k:"calendar",label:"日历",icon:CalendarIcon},
                {k:"stats",label:"统计",icon:PieIcon},
                {k:"manage",label:"管理",icon:SlidersHorizontal},
              ].map(n=>(
                <button key={n.k} onClick={()=>setTab(n.k as any)} className={cn("flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition", tab===n.k ? "text-violet-600" : "text-zinc-500")}>
                  <n.icon className={cn("size-[22px] transition", tab===n.k && "scale-110")} />
                  <span className="text-[11px] leading-none">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* FAB */}
        <button onClick={()=>setShowAdd(true)} className="fixed right-[calc(50%-220px)] bottom-[92px] z-30 size-[56px] rounded-[18px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-xl shadow-violet-300 grid place-items-center active:scale-95 transition">
          <Plus className="size-7" />
        </button>
      </div>

      {/* Add / Edit Modal */}
      {(showAdd || editing) && (
        <AddEditModal
          initial={editing}
          categories={categories}
          onClose={()=>{setShowAdd(false); setEditing(null)}}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-top { padding-top: env(safe-area-inset-top); }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

function AddEditModal({ initial, categories, onClose, onSave, onDelete }:{
  initial: CollectionItem | null;
  categories: string[];
  onClose: ()=>void;
  onSave: (i:CollectionItem)=>void;
  onDelete: (id:string)=>void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<CollectionItem>(() => initial || {
    id: `i_${Date.now()}`,
    name: "",
    category: categories[0] || "其他",
    tags: [],
    originalPrice: 0,
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: format(new Date(),"yyyy-MM-dd"),
    isFree: false,
    source: "",
    location: "",
    notes: "",
  });
  const [tagInput, setTagInput] = useState(initial?.tags.join(",") || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = async (f: File) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };
    try {
      console.log(`Original image size: ${(f.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(f, options);
      console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, image: reader.result as string });
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
      // 如果压缩失败，则使用原图
      const reader = new FileReader();
      reader.onload = () => setForm({ ...form, image: reader.result as string });
      reader.readAsDataURL(f);
    }
  };

  const daysHeld = differenceInDays(new Date(), parseISO(form.purchaseDate));
  const dailyCost = getDailyCost(form);
  const usageLabel = getUsageCostLabel(form);

  const perLesson = (form.category==="课程" && form.courseTotal) ? (Math.max(0, form.originalPrice - form.purchasePrice) / form.courseTotal) : 0;
  const savedCourse = (form.category==="课程" && form.courseTotal) ? perLesson * (form.courseCompleted||0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[480px] max-h-[92vh] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-4 h-[52px] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">{isEdit ? "编辑藏品" : "快速录入"}</h2>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-xl hover:bg-zinc-100"><X className="size-5" /></button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-4">
          {/* Photo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium flex items-center gap-1.5"><Camera className="size-4 text-violet-600" /> 拍照 / 相册</label>
              <span className="text-[11px] text-zinc-500">自动居中 · 美观卡片</span>
            </div>
            <button onClick={()=>fileRef.current?.click()} className="w-full aspect-[16/9] rounded-[20px] border-2 border-dashed border-violet-200 bg-violet-50/50 overflow-hidden relative group">
              {form.image ? (
                <>
                  <img src={form.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition grid place-items-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 rounded-xl bg-white/90 text-[12px] font-medium">更换图片</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full grid place-items-center text-violet-600">
                  <div className="text-center">
                    <ImageIcon className="size-8 mx-auto mb-1.5 opacity-70" />
                    <p className="text-[13px] font-medium">点击上传图片</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">支持拍照、相册</p>
                  </div>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) handleImage(f).catch(console.error)}} />
          </div>

          {/* Basic */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[12px] text-zinc-600">名称 *</label>
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="例如：Notion 高效训练营" className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-violet-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-zinc-600">分类</label>
                <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]">
                  {categories.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-zinc-600">数量</label>
                <input type="number" min={1} value={form.quantity} onChange={e=>setForm({...form, quantity: parseInt(e.target.value)||1})} className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-zinc-600">原价</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]">¥</span>
                  <input type="number" value={form.originalPrice} onChange={e=>setForm({...form, originalPrice: parseFloat(e.target.value)||0})} className="w-full h-11 pl-7 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
                </div>
              </div>
              <div>
                <label className="text-[12px] text-zinc-600 flex items-center gap-1.5">
                  购入价
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={form.isFree} onChange={e=>setForm({...form, isFree:e.target.checked, purchasePrice: e.target.checked?0:form.purchasePrice})} className="size-3.5 accent-pink-500" />
                    <span className="text-[11px] text-pink-600 font-medium">白嫖</span>
                  </label>
                </label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]">¥</span>
                  <input type="number" disabled={form.isFree} value={form.purchasePrice} onChange={e=>setForm({...form, purchasePrice: parseFloat(e.target.value)||0})} className="w-full h-11 pl-7 pr-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px] disabled:opacity-60" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-zinc-600">购买日期</label>
                <input type="date" value={form.purchaseDate} onChange={e=>setForm({...form, purchaseDate:e.target.value})} className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
              </div>
              <div>
                <label className="text-[12px] text-zinc-600">到期/保质期</label>
                <input type="date" value={form.expiryDate||""} onChange={e=>setForm({...form, expiryDate:e.target.value||undefined})} className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-zinc-600">来源</label>
                <input value={form.source||""} onChange={e=>setForm({...form, source:e.target.value})} placeholder="京东/B站/官网" className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
              </div>
              <div>
                <label className="text-[12px] text-zinc-600">位置</label>
                <input value={form.location||""} onChange={e=>setForm({...form, location:e.target.value})} placeholder="书架/云端" className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
              </div>
            </div>

            {/* 评分 */}
            <div>
              <label className="text-[12px] text-zinc-600 flex items-center gap-1.5">
                <span>评分</span>
                {form.rating && form.rating > 0 && (
                  <span className="text-[11px] text-amber-600 font-medium">{form.rating.toFixed(1)} 分</span>
                )}
              </label>
              <div className="mt-1 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <StarRating 
                  value={form.rating || 0} 
                  onChange={(rating) => setForm({...form, rating})}
                  size="md"
                />
                {form.rating && form.rating > 0 && (
                  <button 
                    type="button"
                    onClick={() => setForm({...form, rating: undefined})}
                    className="mt-1.5 text-[11px] text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    清除评分
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[12px] text-zinc-600 flex items-center gap-1"><TagIcon className="size-3.5" /> 标签 (逗号分隔)</label>
              <input value={tagInput} onChange={e=>setTagInput(e.target.value)} placeholder="白嫖,限时,生产力" className="mt-1 w-full h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px]" />
            </div>

            <div>
              <label className="text-[12px] text-zinc-600">评语</label>
              <textarea value={form.notes||""} onChange={e=>setForm({...form, notes:e.target.value})} rows={2} placeholder="记录心得、使用感受..." className="mt-1 w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[14px] resize-none" />
            </div>

            <div className="rounded-[20px] border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-medium text-emerald-700">灵活日均成本计算</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">勾选后优先按 (原价-购入价) ÷ 使用天数/次数/自定义单位 计算</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!form.useUsageCost}
                  onChange={e=>setForm({
                    ...form,
                    useUsageCost: e.target.checked,
                    usageType: e.target.checked ? (form.usageType || "days") : undefined,
                    usageCount: e.target.checked ? (form.usageCount || 0) : undefined,
                    usageUnit: e.target.checked ? form.usageUnit : undefined,
                  })}
                  className="size-4 accent-emerald-500"
                />
              </div>

              {form.useUsageCost && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-600">计算方式</label>
                    <select
                      value={form.usageType || "days"}
                      onChange={e=>setForm({...form, usageType: e.target.value as CollectionItem["usageType"], usageUnit: e.target.value === "custom" ? (form.usageUnit || "") : undefined})}
                      className="mt-1 w-full h-10 px-3 rounded-xl bg-white border border-emerald-200 text-[14px]"
                    >
                      <option value="days">按天数</option>
                      <option value="times">按次数</option>
                      <option value="custom">自定义单位</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-600">数量</label>
                    <input
                      type="number"
                      min={1}
                      value={form.usageCount || ""}
                      onChange={e=>setForm({...form, usageCount: parseInt(e.target.value)||0})}
                      className="mt-1 w-full h-10 px-3 rounded-xl bg-white border border-emerald-200 text-[14px]"
                      placeholder="请输入数量"
                    />
                  </div>

                  {form.usageType === "custom" && (
                    <div className="col-span-2">
                      <label className="text-[11px] text-zinc-600">自定义单位</label>
                      <input
                        value={form.usageUnit || ""}
                        onChange={e=>setForm({...form, usageUnit: e.target.value})}
                        className="mt-1 w-full h-10 px-3 rounded-xl bg-white border border-emerald-200 text-[14px]"
                        placeholder="例如：片 / 次直播 / 次按摩"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 课程白嫖 */}
          {form.category === "课程" && (
            <div className="rounded-[20px] border border-violet-200 bg-violet-50/60 p-3">
              <h4 className="text-[13px] font-medium flex items-center gap-1.5 text-violet-700"><BookOpen className="size-4" /> 白嫖课程进度</h4>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-600">总节数</label>
                  <input type="number" min={1} value={form.courseTotal||""} onChange={e=>setForm({...form, courseTotal: parseInt(e.target.value)||undefined})} className="mt-1 w-full h-10 px-3 rounded-xl bg-white border border-violet-200 text-[14px]" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600">已完成</label>
                  <input type="number" min={0} max={form.courseTotal||999} value={form.courseCompleted||0} onChange={e=>setForm({...form, courseCompleted: parseInt(e.target.value)||0})} className="mt-1 w-full h-10 px-3 rounded-xl bg-white border border-violet-200 text-[14px]" />
                </div>
              </div>
              {form.courseTotal && form.originalPrice>0 && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-violet-100">
                  <div className="flex justify-between text-[12px]">
                    <span>每节存入</span>
                    <span className="font-medium text-violet-700">¥{perLesson.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-1">
                    <span>已存金额</span>
                    <span className="font-semibold text-pink-600">¥{savedCourse.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={()=>setForm(f=>({...f, courseCompleted: Math.max(0,(f.courseCompleted||0)-1)}))} className="h-8 px-3 rounded-lg bg-zinc-100 text-[12px]">-1 节</button>
                    <button onClick={()=>setForm(f=>({...f, courseCompleted: Math.min(f.courseTotal||999,(f.courseCompleted||0)+1)}))} className="h-8 px-3 rounded-lg bg-violet-600 text-white text-[12px] flex items-center gap-1"><Check className="size-3.5" /> 看完+1</button>
                    <span className="ml-auto text-[11px] text-zinc-500">{form.courseCompleted||0}/{form.courseTotal} 节</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 长期主义 */}
          <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 p-3">
            <h4 className="text-[13px] font-medium flex items-center gap-1.5"><TrendingUp className="size-4 text-zinc-700" /> 长期主义</h4>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white border border-zinc-100">
                <p className="text-[11px] text-zinc-500">持有天数</p>
                <p className="text-[15px] font-semibold">{daysHeld}天</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-zinc-100">
                <p className="text-[11px] text-zinc-500">日均成本</p>
                <p className="text-[15px] font-semibold">¥{dailyCost.toFixed(2)}</p>
                {usageLabel && <p className="text-[10px] text-emerald-600 mt-1">{usageLabel}</p>}
              </div>
              <div className="p-2 rounded-xl bg-white border border-zinc-100">
                <p className="text-[11px] text-zinc-500">节省</p>
                <p className="text-[15px] font-semibold text-pink-600">¥{Math.max(0, form.originalPrice - form.purchasePrice).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 p-3 flex items-center gap-2">
          {isEdit && (
            <button onClick={()=>onDelete(form.id)} className="h-11 px-4 rounded-xl bg-red-50 text-red-600 text-[14px] font-medium flex items-center gap-1.5"><Trash2 className="size-4" /> 删除</button>
          )}
          <button onClick={onClose} className="h-11 px-4 rounded-xl bg-zinc-100 text-zinc-700 text-[14px] font-medium ml-auto">取消</button>
          <button onClick={()=>{
            if (!form.name.trim()) { alert("请填写名称"); return; }
            if (form.useUsageCost) {
              if (!(form.usageCount && form.usageCount > 0)) { alert("请填写有效的使用数量"); return; }
              if (form.usageType === "custom" && !(form.usageUnit || "").trim()) { alert("请填写自定义单位"); return; }
            }
            const final = {...form, tags: tagInput.split(",").map(t=>t.trim()).filter(Boolean)};
            onSave(final);
          }} className="h-11 px-5 rounded-xl bg-violet-600 text-white text-[14px] font-medium shadow-md shadow-violet-200 flex items-center gap-1.5"><Check className="size-4" /> 保存</button>
        </div>
      </div>
    </div>
  );
}
