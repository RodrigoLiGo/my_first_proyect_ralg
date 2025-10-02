import { PrismaClient, Role } from '@prisma/client';

const db = new PrismaClient();

async function seedDatabase(): Promise<void> {
  console.log('🌱 Comenzando la carga inicial de datos...');

  // Lista de tenants iniciales
  const listaTenants = [
    { id: 1, name: 'Tech Solutions' },
    { id: 2, name: 'Marketing Pro' },
    { id: 3, name: 'Consulting Exp' },
  ];

  for (const tenantItem of listaTenants) {
    // Inserta o actualiza tenants
    const tenantCreado = await db.tenant.upsert({
      where: { id: tenantItem.id },
      update: {},
      create: {
        name: tenantItem.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Usuarios por defecto para cada tenant
    const cuentas = [
      {
        email: `admin_${tenantCreado.id}@example.com`,
        name: `Administrador ${tenantCreado.name}`,
        password: 'admin123', // 🔑 en producción usar hashing
        telephone: '8888-0000',
        role: Role.ADMIN,
        tenantId: tenantCreado.id,
      },
      {
        email: `user_${tenantCreado.id}@example.com`,
        name: `Usuario ${tenantCreado.name}`,
        password: 'user123',
        telephone: '8888-1111',
        role: Role.USER,
        tenantId: tenantCreado.id,
      },
    ];

    // Inserta o actualiza usuarios
    for (const cuenta of cuentas) {
      await db.user.upsert({
        where: { email: cuenta.email },
        update: {},
        create: cuenta,
      });
    }
  }

  console.log('✅ Datos iniciales insertados correctamente');
}

seedDatabase()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error('❌ Ocurrió un error durante el seed:', error.message);
    } else {
      console.error('❌ Ocurrió un error durante el seed:', error);
    }
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
