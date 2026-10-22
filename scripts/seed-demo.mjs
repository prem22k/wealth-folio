/**
 * Demo Data Seed Script for Wealth-Folio (Unseal)
 *
 * Seeded Collections:
 * - `transactions`:
 *     - `/` (Home / UnsealDashboard): Net Wealth stream chart, Financial runway gauge, CFO insights, recent activity
 *     - `/stream` (UnsealStream): Full categorized transaction timeline, date grouping, category filters, quick-add
 *     - `/threats` (UnsealThreats): Threat Audit engine (detectSubscriptions vampire cost detector & runAnomalyDetection)
 *
 * Other Pages:
 * - `/vault`: Client-side encrypted statement parser and manual bulk importer (writes to `transactions`)
 * - `/analytics`: Visual intelligence graphs (currently driven by static presentation dataset)
 * - `/settings`: Data sovereignty export and Obsidian mode toggle (no Firestore collections)
 */

const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const FS_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8086';
const PROJECT_ID = process.env.PROJECT_ID || 'demo-wealthfolio';

// SAFETY: Refuse to run against production or non-emulator project
if (!PROJECT_ID.startsWith('demo-')) {
  console.error(
    `Refusing to run: PROJECT_ID "${PROJECT_ID}" does not start with "demo-". This script is for emulator use only.`
  );
  process.exit(1);
}

// Deterministic PRNG (Mulberry32)
function createPrng(seed = 20261022) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toFirestoreFields(data) {
  const fields = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (val instanceof Date) {
      fields[key] = { timestampValue: val.toISOString() };
    }
  }
  return fields;
}

async function getOrCreateDemoUser(authHost) {
  const email = 'demo@unseal.app';
  const password = 'UnsealDemo#2026';
  const displayName = 'Aarav Mehta';

  const signUpUrl = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`;
  const signUpRes = await fetch(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  let localId;
  let idToken;

  if (signUpRes.ok) {
    const data = await signUpRes.json();
    localId = data.localId;
    idToken = data.idToken;
  } else {
    const errData = await signUpRes.json().catch(() => ({}));
    const message = errData.error?.message || '';

    if (message.includes('EMAIL_EXISTS')) {
      const signInUrl = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`;
      const signInRes = await fetch(signInUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      if (!signInRes.ok) {
        const text = await signInRes.text();
        throw new Error(`Failed to sign in demo user: ${signInRes.status} ${text}`);
      }

      const signInData = await signInRes.json();
      localId = signInData.localId;
      idToken = signInData.idToken;
    } else {
      throw new Error(`Failed to sign up demo user: ${signUpRes.status} ${JSON.stringify(errData)}`);
    }
  }

  // Ensure displayName is set
  if (idToken) {
    const updateUrl = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:update?key=demo`;
    await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        displayName,
        returnSecureToken: true,
      }),
    });
  }

  return { userId: localId, email, password, displayName };
}

async function deleteExistingUserDocuments(fsHost, projectId, collectionName, userId) {
  const queryUrl = `http://${fsHost}/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: collectionName }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: userId },
        },
      },
    },
  };

  const res = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer owner',
    },
    body: JSON.stringify(queryBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to query existing ${collectionName}: ${res.status} ${text}`);
  }

  const results = await res.json();
  const docNames = [];
  if (Array.isArray(results)) {
    for (const item of results) {
      if (item.document?.name) {
        docNames.push(item.document.name);
      }
    }
  }

  for (const name of docNames) {
    const deleteUrl = `http://${fsHost}/v1/${name}`;
    const delRes = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer owner',
      },
    });
    if (!delRes.ok) {
      const errText = await delRes.text();
      console.warn(`Warning: failed to delete ${name}: ${delRes.status} ${errText}`);
    }
  }

  return docNames.length;
}

async function insertFirestoreDocument(fsHost, projectId, collectionName, data) {
  const fields = toFirestoreFields(data);
  const writeUrl = `http://${fsHost}/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`;
  const res = await fetch(writeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer owner',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to insert document into ${collectionName}: ${res.status} ${errText}`);
  }
}

function generateTransactions(userId) {
  const rand = createPrng(20261022);
  const now = new Date();
  const txs = [];

  // 1. Monthly Salary: On the 1st of each of the past 4 months (~₹1,15,000)
  for (let m = 0; m < 4; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1, 9, 30, 0);
    txs.push({
      userId,
      amount: 11500000, // ₹1,15,000 in paise
      date: d,
      description: 'SALARY CREDIT/TECHSOLVE LABS PVT LTD/HDFC/CMS001928374',
      category: 'Salary',
      type: 'income',
      source: 'hdfc-bank',
      status: 'verified',
      createdAt: d,
    });
  }

  // 2. Monthly Rent: On the 5th of each of the past 4 months (₹28,000)
  for (let m = 0; m < 4; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 5, 10, 15, 0);
    txs.push({
      userId,
      amount: 2800000, // ₹28,000 in paise
      date: d,
      description: 'UPI/DR/RENT FOR APARTMENT/HDF/landlord@hdfcbank',
      category: 'Housing',
      type: 'expense',
      source: 'upi',
      status: 'verified',
      createdAt: d,
    });
  }

  // 3. Recurring Subscriptions (Vampire costs): Exactly 30-day intervals so detectSubscriptions flags them (28-31 day check)
  // 4 monthly instances each
  const subscriptions = [
    {
      vendor: 'NETFLIX.COM STREAMING MUMBAI IN',
      amount: 64900, // ₹649
      category: 'Entertainment',
      source: 'credit-card',
      baseOffsetDays: 8,
    },
    {
      vendor: 'SPOTIFY INDIA PREMIUM BLR',
      amount: 11900, // ₹119
      category: 'Entertainment',
      source: 'upi',
      baseOffsetDays: 12,
    },
    {
      vendor: 'GOOGLE YOUTUBE MEMBERSHIP G.CO/HELPPAY',
      amount: 12900, // ₹129
      category: 'Entertainment',
      source: 'credit-card',
      baseOffsetDays: 14,
    },
    {
      vendor: 'APPLE SERVICES ICLOUD STORAGE 50GB',
      amount: 7500, // ₹75
      category: 'Utilities',
      source: 'credit-card',
      baseOffsetDays: 18,
    },
    {
      vendor: 'CULTFIT FITNESS GYM MEMBERSHIP BANGALORE',
      amount: 249900, // ₹2,499
      category: 'Health',
      source: 'credit-card',
      baseOffsetDays: 20,
    },
  ];

  for (const sub of subscriptions) {
    for (let i = 0; i < 4; i++) {
      // Step back by exactly 30 days per period
      const daysAgo = sub.baseOffsetDays + i * 30;
      const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      d.setHours(11, 0, 0, 0);
      txs.push({
        userId,
        amount: sub.amount,
        date: d,
        description: sub.vendor,
        category: sub.category,
        type: 'expense',
        source: sub.source,
        status: 'verified',
        createdAt: d,
      });
    }
  }

  // 4. Anomaly: Duplicate Charge (Swiggy order charged twice within 4 minutes)
  const dupDay = 24;
  const dupDate1 = new Date(now.getTime() - dupDay * 24 * 60 * 60 * 1000);
  dupDate1.setHours(20, 15, 0, 0);
  const dupDate2 = new Date(dupDate1.getTime() + 3.5 * 60 * 1000); // 3.5 minutes later

  txs.push({
    userId,
    amount: 48500, // ₹485
    date: dupDate1,
    description: 'UPI/DR/412345678901/SWIGGY/YESB/swiggy@yespay',
    category: 'Food',
    type: 'expense',
    source: 'upi',
    status: 'verified',
    createdAt: dupDate1,
  });
  txs.push({
    userId,
    amount: 48500, // ₹485 (duplicate)
    date: dupDate2,
    description: 'UPI/DR/412345678901/SWIGGY/YESB/swiggy@yespay',
    category: 'Food',
    type: 'expense',
    source: 'upi',
    status: 'verified',
    createdAt: dupDate2,
  });

  // 5. Anomaly: Cost Deviation (Uber rides baseline ₹180-₹240 + one surge airport ride ₹2,850)
  const uberRides = [
    { day: 110, amount: 19000 },
    { day: 95, amount: 22000 },
    { day: 82, amount: 18000 },
    { day: 71, amount: 24000 },
    { day: 58, amount: 21000 },
    { day: 44, amount: 20000 },
    { day: 33, amount: 23000 },
    { day: 26, amount: 19000 },
    { day: 15, amount: 285000 }, // Airport ride ₹2,850 (cost deviation anomaly)
    { day: 9, amount: 22000 },
    { day: 3, amount: 21000 },
  ];
  for (const ride of uberRides) {
    const d = new Date(now.getTime() - ride.day * 24 * 60 * 60 * 1000);
    d.setHours(17, 30, 0, 0);
    txs.push({
      userId,
      amount: ride.amount,
      date: d,
      description: 'UPI/DR/519283746102/UBER/PAYTM/uber@paytm',
      category: 'Travel',
      type: 'expense',
      source: 'upi',
      status: 'verified',
      createdAt: d,
    });
  }

  // 6. Food orders (Zomato & additional Swiggy)
  const foodOrders = [
    { day: 118, amount: 34000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 112, amount: 48000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 105, amount: 26000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 99, amount: 52000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 91, amount: 31000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 85, amount: 64000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 77, amount: 39000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 73, amount: 45000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 65, amount: 58000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 59, amount: 29000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 51, amount: 41000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 47, amount: 62000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 39, amount: 35000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 31, amount: 49000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 22, amount: 38000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 17, amount: 56000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
    { day: 11, amount: 43000, desc: 'UPI/DR/429182746192/ZOMATO/HDFC/zomato@hdfcbank' },
    { day: 4, amount: 51000, desc: 'UPI/DR/481928374619/SWIGGY/YESB/swiggy@yespay' },
  ];
  for (const item of foodOrders) {
    const d = new Date(now.getTime() - item.day * 24 * 60 * 60 * 1000);
    d.setHours(19, 45, 0, 0);
    txs.push({
      userId,
      amount: item.amount,
      date: d,
      description: item.desc,
      category: 'Food',
      type: 'expense',
      source: 'upi',
      status: 'verified',
      createdAt: d,
    });
  }

  // 7. Groceries (Zepto, BigBasket, Blinkit)
  const groceries = [
    { day: 114, amount: 89000, desc: 'UPI/DR/718293049182/ZEPTO/KBL/zepto@kbl' },
    { day: 102, amount: 215000, desc: 'POS 41234567 BIGBASKET BLR IN' },
    { day: 89, amount: 64000, desc: 'UPI/DR/819203918273/BLINKIT/ICIC/blinkit@icici' },
    { day: 76, amount: 142000, desc: 'UPI/DR/718293049182/ZEPTO/KBL/zepto@kbl' },
    { day: 63, amount: 198000, desc: 'POS 41234567 BIGBASKET BLR IN' },
    { day: 49, amount: 78000, desc: 'UPI/DR/819203918273/BLINKIT/ICIC/blinkit@icici' },
    { day: 36, amount: 165000, desc: 'UPI/DR/718293049182/ZEPTO/KBL/zepto@kbl' },
    { day: 25, amount: 230000, desc: 'POS 41234567 BIGBASKET BLR IN' },
    { day: 14, amount: 92000, desc: 'UPI/DR/819203918273/BLINKIT/ICIC/blinkit@icici' },
    { day: 5, amount: 115000, desc: 'UPI/DR/718293049182/ZEPTO/KBL/zepto@kbl' },
  ];
  for (const item of groceries) {
    const d = new Date(now.getTime() - item.day * 24 * 60 * 60 * 1000);
    d.setHours(14, 15, 0, 0);
    txs.push({
      userId,
      amount: item.amount,
      date: d,
      description: item.desc,
      category: 'Food',
      type: 'expense',
      source: item.desc.startsWith('POS') ? 'credit-card' : 'upi',
      status: 'verified',
      createdAt: d,
    });
  }

  // 8. Ola Cabs (alternative travel)
  const olaRides = [
    { day: 108, amount: 24000 },
    { day: 87, amount: 32000 },
    { day: 67, amount: 28000 },
    { day: 42, amount: 35000 },
    { day: 21, amount: 26000 },
    { day: 6, amount: 29000 },
  ];
  for (const item of olaRides) {
    const d = new Date(now.getTime() - item.day * 24 * 60 * 60 * 1000);
    d.setHours(8, 45, 0, 0);
    txs.push({
      userId,
      amount: item.amount,
      date: d,
      description: 'UPI/DR/610293847561/OLACABS/ICIC/ola@icici',
      category: 'Travel',
      type: 'expense',
      source: 'upi',
      status: 'verified',
      createdAt: d,
    });
  }

  // 9. UPI peer transfers to friends
  const peerTransfers = [
    { day: 115, amount: 50000, desc: 'UPI/DR/819203948571/Rahul Sharma/ICIC/rahul@okicici' },
    { day: 98, amount: 120000, desc: 'UPI/DR/918273645019/Pooja Nair/SBI/pooja@oksbi' },
    { day: 84, amount: 35000, desc: 'UPI/DR/610293847192/Vikram Malhotra/HDF/vikram@okhdfcbank' },
    { day: 69, amount: 200000, desc: 'UPI/DR/819203948571/Rahul Sharma/ICIC/rahul@okicici' },
    { day: 53, amount: 75000, desc: 'UPI/DR/918273645019/Pooja Nair/SBI/pooja@oksbi' },
    { day: 38, amount: 150000, desc: 'UPI/DR/610293847192/Vikram Malhotra/HDF/vikram@okhdfcbank' },
    { day: 23, amount: 60000, desc: 'UPI/DR/819203948571/Rahul Sharma/ICIC/rahul@okicici' },
    { day: 7, amount: 45000, desc: 'UPI/DR/918273645019/Pooja Nair/SBI/pooja@oksbi' },
  ];
  for (const item of peerTransfers) {
    const d = new Date(now.getTime() - item.day * 24 * 60 * 60 * 1000);
    d.setHours(16, 20, 0, 0);
    txs.push({
      userId,
      amount: item.amount,
      date: d,
      description: item.desc,
      category: 'Transfer',
      type: 'transfer',
      source: 'upi',
      status: 'verified',
      createdAt: d,
    });
  }

  // 10. Electricity & Broadband bills (BESCOM & Airtel)
  const utilityBills = [
    { day: 104, amount: 185000, desc: 'BILLPAY/BESCOM ELECTRICITY/HDFC/0918273645' },
    { day: 100, amount: 117900, desc: 'BILLPAY/AIRTEL BROADBAND/HDFC/0192837465' },
    { day: 74, amount: 192000, desc: 'BILLPAY/BESCOM ELECTRICITY/HDFC/0918273645' },
    { day: 70, amount: 117900, desc: 'BILLPAY/AIRTEL BROADBAND/HDFC/0192837465' },
    { day: 43, amount: 178000, desc: 'BILLPAY/BESCOM ELECTRICITY/HDFC/0918273645' },
    { day: 39, amount: 117900, desc: 'BILLPAY/AIRTEL BROADBAND/HDFC/0192837465' },
  ];
  for (const item of utilityBills) {
    const d = new Date(now.getTime() - item.day * 24 * 60 * 60 * 1000);
    d.setHours(12, 0, 0, 0);
    txs.push({
      userId,
      amount: item.amount,
      date: d,
      description: item.desc,
      category: 'Utilities',
      type: 'expense',
      source: 'hdfc-bank',
      status: 'verified',
      createdAt: d,
    });
  }

  // 11. Credit Card Payments (3 bills)
  const ccBills = [
    { day: 92, amount: 2245000 },
    { day: 61, amount: 2610000 },
    { day: 30, amount: 1980000 },
  ];
  for (const item of ccBills) {
    const d = new Date(now.getTime() - item.day * 24 * 60 * 60 * 1000);
    d.setHours(15, 0, 0, 0);
    txs.push({
      userId,
      amount: item.amount,
      date: d,
      description: 'AUTOPAY/HDFC REGALIA CREDIT CARD BILL/HDFCPAY',
      category: 'Bills',
      type: 'expense',
      source: 'hdfc-bank',
      status: 'verified',
      createdAt: d,
    });
  }

  // 12. One refund
  const refundDate = new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000);
  refundDate.setHours(13, 10, 0, 0);
  txs.push({
    userId,
    amount: 149900, // ₹1,499
    date: refundDate,
    description: 'UPI/CR/192837465019/AMAZON PAY REFUND/HDFC',
    category: 'Shopping',
    type: 'income',
    source: 'upi',
    status: 'verified',
    createdAt: refundDate,
  });

  return txs;
}

async function main() {
  console.log('--- Unseal Demo Data Seeder ---');
  console.log(`Auth Host:     ${AUTH_HOST}`);
  console.log(`Firestore Host:${FS_HOST}`);
  console.log(`Project ID:    ${PROJECT_ID}`);

  // 1. Authenticate / Create Demo User
  console.log('\nProvisioning demo user in Auth emulator...');
  const user = await getOrCreateDemoUser(AUTH_HOST);
  console.log(`✓ User ready: ${user.email} (UID: ${user.userId})`);

  // 2. Clear Existing Documents for Idempotence
  console.log('\nCleaning previous seeded documents in Firestore...');
  const deletedCount = await deleteExistingUserDocuments(FS_HOST, PROJECT_ID, 'transactions', user.userId);
  console.log(`✓ Removed ${deletedCount} existing transaction documents for UID ${user.userId}`);

  // 3. Generate Transactions
  const transactions = generateTransactions(user.userId);
  console.log(`\nSeeding ${transactions.length} transactions spread over past 120 days...`);

  // 4. Insert into Firestore
  let inserted = 0;
  for (const tx of transactions) {
    await insertFirestoreDocument(FS_HOST, PROJECT_ID, 'transactions', tx);
    inserted++;
  }
  console.log(`✓ Successfully written ${inserted} transactions to Firestore.`);

  // 5. Final Summary
  console.log('\n========================================');
  console.log('           SEED SUMMARY                 ');
  console.log('========================================');
  console.log(`User:         ${user.email}`);
  console.log(`Password:     ${user.password}`);
  console.log(`Display Name: ${user.displayName}`);
  console.log(`UID:          ${user.userId}`);
  console.log('----------------------------------------');
  console.log(`Collection: transactions`);
  console.log(`  Count:   ${inserted} documents seeded`);
  console.log(`  Deleted: ${deletedCount} previous documents`);
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('\nSeed failed with error:\n', err);
  process.exit(1);
});
