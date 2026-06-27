/**
 * Production seed: catalog reference data (cities, categories, occasions, colors)
 * + a single admin user. NO test users, NO sample listings.
 *
 * Admin credentials come from env (fallback to defaults):
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Run against whatever DATABASE_URL is in apps/api/.env:
 *   pnpm --filter api exec ts-node -r tsconfig-paths/register scripts/seedProd.ts
 */
import { PrismaClient, UserSignupMethod, UserType } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  // ---- Cities ------------------------------------------------------------
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
    await prisma.city.upsert({
      where: { slug: slug(c.name) },
      update: { state: c.state },
      create: { slug: slug(c.name), name: c.name, state: c.state, isServiceable: true },
    });
  }

  // ---- Categories --------------------------------------------------------
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
  for (let i = 0; i < categories.length; i += 1) {
    const name = categories[i];
    await prisma.category.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { slug: slug(name), name, order: i, isActive: true },
    });
  }

  // ---- Occasions ---------------------------------------------------------
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
    await prisma.occasion.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { slug: slug(name), name, order: i, isActive: true },
    });
  }

  // ---- Colors ------------------------------------------------------------
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
    await prisma.color.upsert({
      where: { slug: slug(name) },
      update: { hex },
      create: { slug: slug(name), name, hex, order: i, isActive: true },
    });
  }

  // ---- Admin user --------------------------------------------------------
  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail, deletedAt: { isSet: false } },
  });
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { type: UserType.ADMIN, password: await argon.hash(adminPassword) },
    });
    // eslint-disable-next-line no-console
    console.log(`[seedProd] Updated existing admin: ${adminEmail}`);
  } else {
    await prisma.user.create({
      data: {
        type: UserType.ADMIN,
        signupMethod: UserSignupMethod.EMAIL,
        email: adminEmail,
        password: await argon.hash(adminPassword),
        firstName: 'Vastriq',
        lastName: 'Admin',
        emailVerifiedAt: new Date(),
      },
    });
    // eslint-disable-next-line no-console
    console.log(`[seedProd] Created admin: ${adminEmail}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[seedProd] Done. Cities: ${cities.length}, Categories: ${categories.length}, Occasions: ${occasions.length}, Colors: ${colors.length}`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
