import { PrismaClient } from '@prisma/client';
import { INITIAL_PIPELINES, INITIAL_DEALS, INITIAL_CONTACTS } from '../src/lib/crmData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SQLite database from prisma/seed.ts...');

  await prisma.pipelineStage.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.pipeline.deleteMany();
  await prisma.contact.deleteMany();

  for (const pipe of INITIAL_PIPELINES) {
    await prisma.pipeline.create({
      data: {
        id: pipe.id,
        name: pipe.name,
        description: pipe.description,
        type: pipe.type,
        stages: {
          create: pipe.stages.map((stg) => ({
            id: stg.id,
            name: stg.name,
            order: stg.order,
            probability: stg.probability,
            color: stg.color,
          })),
        },
      },
    });
  }

  for (const deal of INITIAL_DEALS) {
    await prisma.deal.create({
      data: {
        id: deal.id,
        name: deal.name,
        company: deal.company,
        value: deal.value,
        stageName: deal.stageName,
        probability: deal.probability,
        owner: deal.owner,
        expectedClose: deal.expectedClose,
        contactName: deal.contactName,
        contactEmail: deal.contactEmail,
        pipelineId: deal.pipelineId,
      },
    });
  }

  for (const contact of INITIAL_CONTACTS) {
    await prisma.contact.create({
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        company: contact.company,
        role: contact.role,
        status: contact.status,
        lastActivity: contact.lastActivity,
        dealValue: contact.dealValue,
      },
    });
  }

  console.log('✅ SQLite Database successfully populated with initial data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
