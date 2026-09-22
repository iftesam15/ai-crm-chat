import { prisma } from './prisma';
import { ensureDbSeeded } from './seedDb';
import { Pipeline, Deal, Contact, CrmStats, calculateCrmStats, INITIAL_PIPELINES, INITIAL_DEALS, INITIAL_CONTACTS } from '../crmData';

export const crmStore = {
  async init(): Promise<void> {
    await ensureDbSeeded();
  },

  async getPipelines(): Promise<Pipeline[]> {
    await ensureDbSeeded();
    const rows = await prisma.pipeline.findMany({
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      type: r.type as any,
      createdAt: r.createdAt.toISOString().split('T')[0],
      stages: r.stages.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        probability: s.probability,
        dealCount: 0,
        color: s.color,
      })),
    }));
  },

  async addPipeline(pipeline: {
    id?: string;
    name: string;
    description?: string;
    type?: string;
    stages: Array<{ name: string; order: number; probability: number; color?: string }>;
  }): Promise<Pipeline> {
    await ensureDbSeeded();
    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    const created = await prisma.pipeline.create({
      data: {
        id: pipeline.id || `pipe-${Date.now().toString(36)}`,
        name: pipeline.name,
        description: pipeline.description || '',
        type: pipeline.type || 'enterprise',
        stages: {
          create: pipeline.stages.map((stg, idx) => ({
            id: `stg-${Date.now()}-${idx}`,
            name: stg.name,
            order: stg.order || idx + 1,
            probability: stg.probability,
            color: stg.color || colors[idx % colors.length],
          })),
        },
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    console.log(`💾 [SQLite] Pipeline saved to database: "${created.name}" (${created.id})`);

    return {
      id: created.id,
      name: created.name,
      description: created.description || '',
      type: created.type as any,
      createdAt: created.createdAt.toISOString().split('T')[0],
      stages: created.stages.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        probability: s.probability,
        dealCount: 0,
        color: s.color,
      })),
    };
  },

  async getDeals(): Promise<Deal[]> {
    await ensureDbSeeded();
    const rows = await prisma.deal.findMany({
      orderBy: { value: 'desc' },
    });

    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      company: d.company,
      value: d.value,
      pipelineId: d.pipelineId || 'pipe-enterprise',
      stageName: d.stageName,
      probability: d.probability,
      owner: d.owner,
      expectedClose: d.expectedClose,
      contactName: d.contactName || '',
      contactEmail: d.contactEmail || '',
    }));
  },

  async updateDeal(dealId: string, updates: Partial<Deal>): Promise<Deal | null> {
    await ensureDbSeeded();
    try {
      const updated = await prisma.deal.update({
        where: { id: dealId },
        data: {
          stageName: updates.stageName,
          probability: updates.probability,
          value: updates.value,
          owner: updates.owner,
        },
      });

      console.log(`💾 [SQLite] Deal "${updated.name}" updated in database.`);

      return {
        id: updated.id,
        name: updated.name,
        company: updated.company,
        value: updated.value,
        pipelineId: updated.pipelineId || 'pipe-enterprise',
        stageName: updated.stageName,
        probability: updated.probability,
        owner: updated.owner,
        expectedClose: updated.expectedClose,
        contactName: updated.contactName || '',
        contactEmail: updated.contactEmail || '',
      };
    } catch (err) {
      console.error('Failed to update deal in SQLite:', err);
      return null;
    }
  },

  async getContacts(): Promise<Contact[]> {
    await ensureDbSeeded();
    const rows = await prisma.contact.findMany({
      orderBy: { name: 'asc' },
    });

    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company,
      role: c.role,
      status: c.status as any,
      lastActivity: c.lastActivity || '',
      dealValue: c.dealValue || 0,
    }));
  },

  async getStats(): Promise<CrmStats> {
    const [deals, pipelines, contacts] = await Promise.all([
      this.getDeals(),
      this.getPipelines(),
      this.getContacts(),
    ]);
    return calculateCrmStats(deals, pipelines, contacts);
  },

  async getFullSnapshot() {
    const [deals, pipelines, contacts] = await Promise.all([
      this.getDeals(),
      this.getPipelines(),
      this.getContacts(),
    ]);

    return {
      pipelines,
      deals,
      contacts,
      stats: calculateCrmStats(deals, pipelines, contacts),
    };
  },

  async reset(): Promise<void> {
    console.log('🔄 [SQLite] Resetting database to default seed state...');
    await prisma.pipelineStage.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.pipeline.deleteMany();
    await prisma.contact.deleteMany();
    await ensureDbSeeded();
  },
};
