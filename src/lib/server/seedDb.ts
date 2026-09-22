import { prisma } from './prisma';
import { INITIAL_PIPELINES, INITIAL_DEALS, INITIAL_CONTACTS } from '../crmData';

export async function ensureDbSeeded(): Promise<void> {
  try {
    const count = await prisma.pipeline.count();
    if (count > 0) return; // already seeded

    console.log('🌱 Seeding SQLite database (dev.db) with initial CRM pipelines, deals, and contacts...');

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

    console.log('✅ SQLite database successfully seeded!');
  } catch (err) {
    console.error('Database seeding error:', err);
  }
}
