import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Beauty'];
const channels = ['organic', 'ads', 'social', 'email'];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomDateInLastYear(): Date {
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 1);

  const time = start.getTime() + Math.random() * (now.getTime() - start.getTime());
  return new Date(time);
}

async function main() {
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@ecommerce-insight.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Standard User',
      email: 'user@ecommerce-insight.com',
      password: await bcrypt.hash('user123', 10),
      role: Role.USER,
    },
  });

  const products = await prisma.product.createManyAndReturn({
    data: Array.from({ length: 50 }).map((_, idx) => ({
      name: `Product ${idx + 1}`,
      category: randomItem(categories),
      price: Number((Math.random() * 450 + 25).toFixed(2)),
    })),
  });

  const customers = await prisma.customer.createManyAndReturn({
    data: Array.from({ length: 100 }).map((_, idx) => ({
      name: `Customer ${idx + 1}`,
      email: `customer${idx + 1}@mail.com`,
    })),
  });

  const ordersData = Array.from({ length: 1000 }).map(() => {
    const product = randomItem(products);
    const customer = randomItem(customers);
    const quantity = Math.floor(Math.random() * 5) + 1;
    return {
      productId: product.id,
      customerId: customer.id,
      quantity,
      total: Number((product.price * quantity).toFixed(2)),
      salesChannel: randomItem(channels),
      date: randomDateInLastYear(),
    };
  });

  await prisma.order.createMany({ data: ordersData });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
