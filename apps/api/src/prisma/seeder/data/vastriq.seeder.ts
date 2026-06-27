import {
  OutfitStatus,
  Prisma,
  PrismaClient,
  UserSignupMethod,
  UserType,
} from '@prisma/client';
import * as argon from 'argon2';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default async (
  client: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >,
) => {
  // ---- Cities (grouped by state) -----------------------------------------
  const cities = [
    { name: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Surat', state: 'Gujarat' },
    { name: 'Vadodara', state: 'Gujarat' },
    { name: 'Rajkot', state: 'Gujarat' },
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Pune', state: 'Maharashtra' },
    { name: 'Nagpur', state: 'Maharashtra' },
    { name: 'Jaipur', state: 'Rajasthan' },
    { name: 'Udaipur', state: 'Rajasthan' },
    { name: 'Jodhpur', state: 'Rajasthan' },
  ];
  for (const c of cities) {
    await client.city.upsert({
      where: { slug: slug(c.name) },
      update: { state: c.state },
      create: { slug: slug(c.name), name: c.name, state: c.state, isServiceable: true },
    });
  }
  const ahmedabad = await client.city.findUnique({ where: { slug: 'ahmedabad' } });

  // ---- Categories (women's wear — v1) ------------------------------------
  const categories = [
    'Bridal Lehenga',
    'Indo Western',
    'Sider Choli',
    'Pre Wedding Special',
    'Navratri Special',
    'Party Wear',
    'Traditional Wear',
    'Saree',
  ];
  const categoryRecords: Record<string, { id: string }> = {};
  for (let i = 0; i < categories.length; i += 1) {
    const name = categories[i];
    const rec = await client.category.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { slug: slug(name), name, order: i, isActive: true },
    });
    categoryRecords[slug(name)] = { id: rec.id };
  }

  // ---- Occasions ----------------------------------------------------------
  const occasions = [
    'Wedding',
    'Reception',
    'Engagement',
    'Pre-Wedding Shoot',
    'Sangeet',
    'Mehendi',
    'Haldi',
    'Navratri / Garba',
    'Festival (Diwali etc.)',
    'Party / Cocktail',
    'Religious / Pooja',
    'Baby Shower (Godh Bharai)',
    'Anniversary',
    'Birthday',
    'Casual / Day Event',
  ];
  for (let i = 0; i < occasions.length; i += 1) {
    const name = occasions[i];
    await client.occasion.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { slug: slug(name), name, order: i, isActive: true },
    });
  }

  // ---- Colors -------------------------------------------------------------
  const colors: Array<[string, string]> = [
    ['Red', '#C0392B'],
    ['Maroon', '#800000'],
    ['Pink', '#E91E63'],
    ['Rani Pink', '#D81B60'],
    ['Peach', '#FFCBA4'],
    ['Orange', '#E67E22'],
    ['Yellow', '#F1C40F'],
    ['Green', '#27AE60'],
    ['Emerald', '#0F4C3A'],
    ['Teal', '#008080'],
    ['Blue', '#2980B9'],
    ['Navy', '#1A2A6C'],
    ['Purple', '#8E44AD'],
    ['Wine', '#722F37'],
    ['Black', '#1A1A1A'],
    ['White', '#FFFFFF'],
    ['Off-White / Cream', '#FAF7F0'],
    ['Grey', '#7F8C8D'],
    ['Gold', '#D4AF37'],
    ['Silver', '#C0C0C0'],
    ['Beige', '#E8D8C3'],
    ['Multicolor', '#999999'],
  ];
  for (let i = 0; i < colors.length; i += 1) {
    const [name, hex] = colors[i];
    await client.color.upsert({
      where: { slug: slug(name) },
      update: { hex },
      create: { slug: slug(name), name, hex, order: i, isActive: true },
    });
  }

  // ---- Dummy users (phone-only; one user type) ----------------------------
  const ensureUser = async (data: Prisma.UserUncheckedCreateInput) => {
    const existing = await client.user.findFirst({
      where: data.phone
        ? { phone: data.phone, deletedAt: { isSet: false } }
        : { email: data.email, deletedAt: { isSet: false } },
    });
    if (existing) return existing;
    return client.user.create({ data });
  };

  const userA = await ensureUser({
    type: UserType.USER,
    signupMethod: UserSignupMethod.PHONE,
    phone: '+919999900001',
    phoneVerifiedAt: new Date(),
    firstName: 'Aanya',
    lastName: 'Mehta',
    email: 'usera@test.local',
    defaultCityId: ahmedabad?.id,
  });

  await ensureUser({
    type: UserType.USER,
    signupMethod: UserSignupMethod.PHONE,
    phone: '+919999900002',
    phoneVerifiedAt: new Date(),
    firstName: 'Riya',
    lastName: 'Shah',
    email: 'userb@test.local',
    defaultCityId: ahmedabad?.id,
  });

  const userC = await ensureUser({
    type: UserType.USER,
    signupMethod: UserSignupMethod.PHONE,
    phone: '+919999900003',
    phoneVerifiedAt: new Date(),
    firstName: 'Pending',
    lastName: 'Lister',
    email: 'userc@test.local',
    defaultCityId: ahmedabad?.id,
  });

  await ensureUser({
    type: UserType.ADMIN,
    signupMethod: UserSignupMethod.EMAIL,
    email: 'admin@test.local',
    password: await argon.hash('Admin@12345'),
    firstName: 'Vastriq',
    lastName: 'Admin',
  });

  // ---- Public display profile for User A ----------------------------------
  await client.ownerProfile.upsert({
    where: { userId: userA.id },
    update: {},
    create: {
      userId: userA.id,
      brandName: 'Heritage Couture',
      bio: 'Curated bridal lehengas and statement pieces from Ahmedabad.',
      rating: 4.7,
    },
  });

  // ---- Sample listings (women's wear, owner-declared price/deposit) --------
  const activeListings = [
    {
      title: 'Emerald Bandhani Bridal Lehenga',
      category: 'bridal-lehenga',
      occasions: ['wedding', 'reception'],
      color: 'Emerald',
      mrp: 65000,
      rentPerDay: 1050,
      securityDeposit: 8000,
    },
    {
      title: 'Rani Pink Indo Western Gown',
      category: 'indo-western',
      occasions: ['party-cocktail', 'reception'],
      color: 'Rani Pink',
      mrp: 28000,
      rentPerDay: 700,
      securityDeposit: 4000,
    },
    {
      title: 'Mehendi Yellow Sider Choli',
      category: 'sider-choli',
      occasions: ['mehendi', 'haldi'],
      color: 'Yellow',
      mrp: 22000,
      rentPerDay: 600,
      securityDeposit: 3500,
    },
    {
      title: 'Royal Maroon Banarasi Saree',
      category: 'saree',
      occasions: ['reception', 'sangeet'],
      color: 'Maroon',
      mrp: 28000,
      rentPerDay: 700,
      securityDeposit: 4000,
    },
    {
      title: 'Teal Navratri Chaniya Choli',
      category: 'navratri-special',
      occasions: ['navratri-garba'],
      color: 'Teal',
      mrp: 18000,
      rentPerDay: 500,
      securityDeposit: 2500,
    },
  ];

  const pendingListings = [
    {
      title: 'Wine Party Wear Gown',
      category: 'party-wear',
      occasions: ['party-cocktail', 'birthday'],
      color: 'Wine',
      mrp: 16000,
      rentPerDay: 450,
      securityDeposit: 2000,
    },
    {
      title: 'Off-White Traditional Anarkali',
      category: 'traditional-wear',
      occasions: ['religious-pooja', 'festival-diwali-etc'],
      color: 'Off-White / Cream',
      mrp: 20000,
      rentPerDay: 550,
      securityDeposit: 3000,
    },
  ];

  const createOutfit = async (
    ownerId: string,
    o: (typeof activeListings)[number],
    status: OutfitStatus,
  ) => {
    const outfitSlug = slug(o.title);
    const exists = await client.outfit.findUnique({ where: { slug: outfitSlug } });
    if (exists) return;
    await client.outfit.create({
      data: {
        ownerId,
        title: o.title,
        slug: outfitSlug,
        description: `A premium ${o.color.toLowerCase()} piece, available on rent across select cities. Chat with the owner to arrange dates.`,
        categoryId: categoryRecords[o.category].id,
        occasionSlugs: o.occasions,
        color: o.color,
        imageUrls: [],
        mrp: o.mrp,
        rentPerDay: o.rentPerDay,
        securityDeposit: o.securityDeposit,
        citySlugs: ['ahmedabad', 'surat', 'mumbai'],
        availabilityNote: 'Usually available except festival weekends. Ask the owner in chat.',
        status,
      },
    });
  };

  for (const o of activeListings) await createOutfit(userA.id, o, OutfitStatus.ACTIVE);
  for (const o of pendingListings) await createOutfit(userC.id, o, OutfitStatus.PENDING);

  // ---- Banner -------------------------------------------------------------
  const existingBanner = await client.banner.findFirst({ where: { title: 'Bridal Edit' } });
  if (!existingBanner) {
    await client.banner.create({
      data: {
        title: 'Bridal Edit',
        imageUrl: '',
        ctaUrl: '/occasion/wedding',
        position: 'hero',
        order: 1,
        isActive: true,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('[VASTRIQ Seeder] Dummy accounts (master OTP 000000):');
  // eslint-disable-next-line no-console
  console.log('  User A (lists+rents) → +919999900001');
  // eslint-disable-next-line no-console
  console.log('  User B               → +919999900002');
  // eslint-disable-next-line no-console
  console.log('  User C (pending)     → +919999900003');
  // eslint-disable-next-line no-console
  console.log('  Admin                → admin@test.local / Admin@12345');
};
