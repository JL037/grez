import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminDid = process.env.ADMIN_DID || 'did:plc:admin-placeholder';

  const admin = await prisma.user.upsert({
    where: { did: adminDid },
    update: {},
    create: {
      did: adminDid,
      handle: 'admin.bsky.social',
      displayName: 'Admin',
      role: 'ADMIN',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { did: 'did:plc:demo-user' },
    update: {},
    create: {
      did: 'did:plc:demo-user',
      handle: 'demo.bsky.social',
      displayName: 'Demo User',
      role: 'USER',
    },
  });

  const restaurant1 = await prisma.restaurant.upsert({
    where: { id: 'seed-restaurant-1' },
    update: {},
    create: {
      id: 'seed-restaurant-1',
      name: 'Green Table',
      address: '123 Main St, Portland, OR 97201',
      cuisine: 'Farm-to-Table',
      insuranceType: 'Full Health + Dental',
      insuranceProvider: 'Blue Cross Blue Shield',
      website: 'https://greentable.example.com',
      description:
        'A farm-to-table restaurant that provides comprehensive health and dental insurance to all employees, including part-time staff.',
      submittedBy: admin.did,
    },
  });

  const restaurant2 = await prisma.restaurant.upsert({
    where: { id: 'seed-restaurant-2' },
    update: {},
    create: {
      id: 'seed-restaurant-2',
      name: 'Taco Collective',
      address: '456 Oak Ave, Austin, TX 78701',
      cuisine: 'Mexican',
      insuranceType: 'Health + Vision',
      insuranceProvider: 'Aetna',
      website: 'https://tacocollective.example.com',
      description:
        'Worker-owned taco shop offering health and vision insurance from day one of employment.',
      submittedBy: admin.did,
    },
  });

  const restaurant3 = await prisma.restaurant.upsert({
    where: { id: 'seed-restaurant-3' },
    update: {},
    create: {
      id: 'seed-restaurant-3',
      name: 'Noodle House',
      address: '789 Pine Blvd, Seattle, WA 98101',
      cuisine: 'Asian Fusion',
      insuranceType: 'Full Health',
      insuranceProvider: 'Kaiser Permanente',
      description:
        'Family-owned noodle shop providing full health coverage to all full-time employees.',
      submittedBy: demoUser.did,
    },
  });

  await prisma.review.upsert({
    where: {
      restaurantId_authorDid: {
        restaurantId: restaurant1.id,
        authorDid: demoUser.did,
      },
    },
    update: {},
    create: {
      restaurantId: restaurant1.id,
      authorDid: demoUser.did,
      rating: 5,
      body: 'Amazing food and even more amazing that they take care of their employees. Highly recommend!',
    },
  });

  await prisma.review.upsert({
    where: {
      restaurantId_authorDid: {
        restaurantId: restaurant2.id,
        authorDid: admin.did,
      },
    },
    update: {},
    create: {
      restaurantId: restaurant2.id,
      authorDid: admin.did,
      rating: 4,
      body: 'Great tacos, love supporting a worker-owned business that provides insurance.',
    },
  });

  const generalCategory = await prisma.forumCategory.upsert({
    where: { slug: 'general' },
    update: {},
    create: {
      name: 'General Discussion',
      slug: 'general',
      description: 'General discussion about restaurants and employee insurance.',
    },
  });

  await prisma.forumCategory.upsert({
    where: { slug: 'recommendations' },
    update: {},
    create: {
      name: 'Recommendations',
      slug: 'recommendations',
      description: 'Recommend restaurants that provide great insurance benefits.',
    },
  });

  const thread = await prisma.forumThread.upsert({
    where: { id: 'seed-thread-1' },
    update: {},
    create: {
      id: 'seed-thread-1',
      categoryId: generalCategory.id,
      title: 'Welcome to Grez!',
      body: 'This is a community dedicated to celebrating restaurants that provide insurance for their employees. Share your favorites!',
      authorDid: admin.did,
    },
  });

  await prisma.forumPost.upsert({
    where: { id: 'seed-post-1' },
    update: {},
    create: {
      id: 'seed-post-1',
      threadId: thread.id,
      authorDid: demoUser.did,
      body: 'Love this idea! Excited to see this community grow.',
    },
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
