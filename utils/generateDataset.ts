import fs from 'fs';
import path from 'path';

const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Beauty'];
const CHANNELS = ['organic', 'ads', 'social', 'email'] as const;

const PRODUCTS_BY_CATEGORY: Record<string, { name: string; basePrice: number }[]> = {
  Electronics: [
    { name: 'iPhone 15 Pro', basePrice: 8999 },
    { name: 'Samsung Galaxy S24', basePrice: 5499 },
    { name: 'MacBook Air M3', basePrice: 11999 },
    { name: 'AirPods Pro', basePrice: 1799 },
    { name: 'iPad Pro 12.9"', basePrice: 7499 },
    { name: 'Sony WH-1000XM5', basePrice: 2199 },
    { name: 'Dell XPS 15', basePrice: 9999 },
    { name: 'Apple Watch Ultra 2', basePrice: 5999 },
    { name: 'NVIDIA RTX 4080', basePrice: 5499 },
    { name: 'LG OLED C3 65"', basePrice: 8999 },
  ],
  Clothing: [
    { name: 'Camiseta Nike Dri-FIT', basePrice: 159 },
    { name: 'Tênis Adidas Ultraboost', basePrice: 899 },
    { name: 'Jaqueta North Face', basePrice: 1299 },
    { name: 'Calça Levi\'s 501', basePrice: 399 },
    { name: 'Moletom Champion', basePrice: 299 },
    { name: 'Vestido Zara Midi', basePrice: 249 },
    { name: 'Tênis New Balance 574', basePrice: 699 },
    { name: 'Polo Ralph Lauren', basePrice: 399 },
    { name: 'Shorts Oakley', basePrice: 199 },
    { name: 'Blusa Farm Rio', basePrice: 299 },
  ],
  Home: [
    { name: 'Aspirador Dyson V15', basePrice: 3499 },
    { name: 'Cafeteira Nespresso', basePrice: 799 },
    { name: 'Jogo de Cama Plumasul', basePrice: 299 },
    { name: 'Air Fryer Philips Walita', basePrice: 499 },
    { name: 'Robô Aspirador iRobot', basePrice: 2999 },
    { name: 'Luminária Ring Light', basePrice: 199 },
    { name: 'Panela Elétrica Mondial', basePrice: 149 },
    { name: 'Purificador Electrolux', basePrice: 799 },
    { name: 'Mesa de Escritório Glass', basePrice: 699 },
    { name: 'Cadeira Gamer DXRacer', basePrice: 1999 },
  ],
  Sports: [
    { name: 'Bicicleta Soul SL929', basePrice: 4999 },
    { name: 'Esteira Kikos F180', basePrice: 3499 },
    { name: 'Halter Emborrachado 10kg', basePrice: 149 },
    { name: 'Tênis Asics Kayano 30', basePrice: 899 },
    { name: 'Bermuda Compressão Under Armour', basePrice: 249 },
    { name: 'Mochila Osprey Talon', basePrice: 699 },
    { name: 'Prancha de Surf 6\'8"', basePrice: 1299 },
    { name: 'Luva de Box Everlast', basePrice: 199 },
    { name: 'Kettlebell 16kg', basePrice: 299 },
    { name: 'Capacete Ciclismo Bell', basePrice: 599 },
  ],
  Books: [
    { name: 'Clean Code - Robert Martin', basePrice: 89 },
    { name: 'O Poder do Hábito', basePrice: 49 },
    { name: 'Sapiens - Harari', basePrice: 59 },
    { name: 'Mindset - Carol Dweck', basePrice: 49 },
    { name: 'Design Patterns - GoF', basePrice: 119 },
    { name: 'The Pragmatic Programmer', basePrice: 109 },
    { name: 'Atomic Habits', basePrice: 55 },
    { name: 'Trabalhe 4 Horas Por Semana', basePrice: 45 },
    { name: 'Zero to One - Peter Thiel', basePrice: 55 },
    { name: 'Steve Jobs - Isaacson', basePrice: 65 },
  ],
  Beauty: [
    { name: 'Perfume Chanel N°5', basePrice: 799 },
    { name: 'Kit Skin Care Neutrogena', basePrice: 199 },
    { name: 'Batom MAC Ruby Woo', basePrice: 119 },
    { name: 'Sérum Vitamina C Melanie', basePrice: 149 },
    { name: 'Protetor Solar Isdin 60+', basePrice: 189 },
    { name: 'Shampoo Kérastase', basePrice: 249 },
    { name: 'Base MAC Studio Fix', basePrice: 189 },
    { name: 'Óleo de Argan Moroccan', basePrice: 129 },
    { name: 'Esmalte Risqué', basePrice: 19 },
    { name: 'Mascara Maybelline Sky High', basePrice: 79 },
  ],
};

const FIRST_NAMES = [
  'Ana', 'Carlos', 'Mariana', 'Pedro', 'Juliana', 'Rafael', 'Fernanda', 'Lucas',
  'Beatriz', 'Thiago', 'Camila', 'Gabriel', 'Leticia', 'Rodrigo', 'Amanda',
  'Felipe', 'Isabela', 'Matheus', 'Larissa', 'Vinícius', 'Patricia', 'Eduardo',
  'Natalia', 'Bruno', 'Carolina', 'Diego', 'Renata', 'Leonardo', 'Vanessa', 'Gustavo',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Almeida', 'Lopes', 'Sousa', 'Fernandes', 'Vieira', 'Barbosa',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProductId(index: number): string {
  return `PRD-${String(index + 1).padStart(4, '0')}`;
}

function generateOrderId(index: number): string {
  return `ORD-${String(index + 1).padStart(6, '0')}`;
}

function randomDate(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString().split('T')[0];
}

// Weight more recent dates to simulate growth trend
function weightedDate(): string {
  const endDate = new Date('2025-03-16');
  const startDate = new Date('2024-03-17');

  // Apply growth weight — recent months more likely
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const rand = Math.random();
  // Slight upward trend
  const dayOffset = Math.floor(Math.pow(rand, 0.8) * totalDays);
  const date = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  stock: number;
  rating: number;
  reviews: number;
}

interface Order {
  id: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
  customer: string;
  salesChannel: string;
}

function generateProducts(): Product[] {
  const products: Product[] = [];
  let index = 0;

  for (const category of CATEGORIES) {
    const categoryProducts = PRODUCTS_BY_CATEGORY[category];
    for (const p of categoryProducts) {
      products.push({
        id: generateProductId(index++),
        name: p.name,
        category,
        basePrice: p.basePrice,
        stock: randomInt(5, 500),
        rating: parseFloat(randomFloat(3.5, 5.0).toFixed(1)),
        reviews: randomInt(10, 2500),
      });
    }
  }

  // Fill up to 200 products with variations
  while (products.length < 200) {
    const category = randomItem(CATEGORIES);
    const base = randomItem(PRODUCTS_BY_CATEGORY[category]);
    const variation = randomItem(['Premium', 'Pro', 'Plus', 'Ultra', 'Lite', 'Mini', 'Max', 'SE']);
    products.push({
      id: generateProductId(index++),
      name: `${base.name} ${variation}`,
      category,
      basePrice: Math.round(base.basePrice * randomFloat(0.7, 1.4)),
      stock: randomInt(0, 300),
      rating: parseFloat(randomFloat(3.0, 5.0).toFixed(1)),
      reviews: randomInt(5, 1500),
    });
  }

  return products;
}

function generateOrders(products: Product[]): Order[] {
  const orders: Order[] = [];

  // Channel distribution weights
  const channelWeights = [
    { channel: 'organic', weight: 35 },
    { channel: 'ads', weight: 30 },
    { channel: 'social', weight: 20 },
    { channel: 'email', weight: 15 },
  ];

  function weightedChannel(): string {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const { channel, weight } of channelWeights) {
      cumulative += weight;
      if (rand <= cumulative) return channel;
    }
    return 'organic';
  }

  for (let i = 0; i < 5000; i++) {
    const product = randomItem(products);
    const quantity = randomInt(1, 5);
    // Add price variance
    const priceVariance = randomFloat(0.9, 1.1);
    const price = Math.round(product.basePrice * priceVariance * 100) / 100;
    const total = Math.round(price * quantity * 100) / 100;
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);

    orders.push({
      id: generateOrderId(i),
      productId: product.id,
      productName: product.name,
      category: product.category,
      price,
      quantity,
      total,
      date: weightedDate(),
      customer: `${firstName} ${lastName}`,
      salesChannel: weightedChannel(),
    });
  }

  // Sort by date
  orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return orders;
}

function main() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('Generating products...');
  const products = generateProducts();
  fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
  console.log(`✓ Generated ${products.length} products`);

  console.log('Generating orders...');
  const orders = generateOrders(products);
  fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(orders, null, 2));
  console.log(`✓ Generated ${orders.length} orders`);

  console.log('Dataset generation complete!');
}

main();
