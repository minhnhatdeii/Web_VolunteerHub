import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

/* -----------------------------------------------------------
   GET /api/admin/events — list events with optional status filter
   Admin only - can see all events, not just pending approval
------------------------------------------------------------*/
async function testGetPendingEventsDirectly() {
  try {
    const req = {
      query: {} // No query parameters, should return all events
    };
    
    console.log('Testing getPendingEvents logic directly...');
    
    const { status, q, page = 1, limit = 10 } = req.query;
    const where = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }
    // If no status is provided, admin can see all events (not just pending approval)

    // Add search functionality if query parameter is provided
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination values
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalCount = await prisma.event.count({ where });

    // Get the events with pagination
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    console.log('Events returned from query:', events.length);
    console.log('Total count:', totalCount);
    
    if (events.length > 0) {
      console.log('\nFirst few events:');
      events.slice(0, 3).forEach(event => {
        console.log(`- ID: ${event.id}, Title: ${event.title}, Status: ${event.status}, Created: ${event.createdAt}`);
      });
      
      // Count events by status
      const statusCounts = {};
      events.forEach(event => {
        statusCounts[event.status] = (statusCounts[event.status] || 0) + 1;
      });
      console.log('\nEvents by status:', statusCounts);
    } else {
      console.log('No events returned by the query!');
    }
    
    // Create the response structure that the API would return
    const response = {
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
      }
    };
    
    console.log('\nAPI would return this structure:');
    console.log(`Total data items: ${response.data.length}`);
    console.log(`Pagination info:`, response.pagination);
    
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testGetPendingEventsDirectly();