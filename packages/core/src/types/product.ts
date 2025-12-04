export type Product= {
    id: string;               // Same value referenced by subItem.productId
    name: string;             // "Water 1.5L"
    brand?: string;           // "Erikli"
    category?: string;        // "Water"
    defaultUnit?: string;     // "L", "pcs"
    defaultStandardUnit?: string; // e.g. "L"
  }

  export type ProductPriceSample ={
    productId: string;        // Links to Product.id
    date: string;             // "YYYY-MM-DD"
    unitPrice: number;        // Price per unit at that time
    currency?: string;        // "TRY", "EUR", "USD", etc.
    storeId?: string;         // Links to Store.id
    storeName?: string;       // "Migros", "BIM", etc.
    pricePerStandardUnit?: number; // Normalized price (e.g. per liter)
  }
  
  export type ProductConsumptionSample ={
    productId: string;             
    transactionId: number | string; 
    date: string;                  // "YYYY-MM-DD"
    quantity: number;              // How much was purchased
    unit?: string;                 // "pcs", "kg", "L"
  }
  