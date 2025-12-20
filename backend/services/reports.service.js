import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Get events aggregated by month for a specific year
 * @param {number} year - Year to filter events (defaults to current year)
 * @returns {Promise<Object>} - Object containing year and monthly data
 */
export const getEventsByMonth = async (year) => {
    const targetYear = year || new Date().getFullYear();

    // Get all events for the specified year
    const events = await prisma.event.findMany({
        where: {
            startDate: {
                gte: new Date(`${targetYear}-01-01`),
                lt: new Date(`${targetYear + 1}-01-01`)
            }
        },
        select: {
            startDate: true
        }
    });

    // Initialize months array with zero counts
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyData = monthNames.map((name, index) => ({
        month: index + 1,
        monthName: name,
        count: 0
    }));

    // Count events per month
    events.forEach(event => {
        const month = new Date(event.startDate).getMonth();
        monthlyData[month].count++;
    });

    return {
        year: targetYear,
        data: monthlyData
    };
};

/**
 * Get dashboard statistics for admin
 * @returns {Promise<Object>} - Dashboard statistics
 */
export const getDashboardStats = async () => {
    // Get counts using Prisma aggregations
    const [
        totalUsers,
        totalEvents,
        totalRegistrations,
        pendingApprovals,
        approvedEvents,
        activeRegistrations
    ] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.registration.count(),
        prisma.event.count({
            where: { status: 'PENDING_APPROVAL' }
        }),
        prisma.event.count({
            where: { status: 'APPROVED' }
        }),
        prisma.registration.count({
            where: {
                status: {
                    in: ['PENDING', 'APPROVED']
                }
            }
        })
    ]);

    return {
        totalUsers,
        totalEvents,
        totalRegistrations,
        pendingApprovals,
        approvedEvents,
        activeRegistrations
    };
};

/**
 * Get detailed event data for export
 * @returns {Promise<Array>} - Array of events with creator info
 */
export const getEventReport = async () => {
    const events = await prisma.event.findMany({
        include: {
            creator: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Format data for CSV export
    return events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        category: event.category || '',
        status: event.status,
        createdBy: event.creator ? `${event.creator.firstName} ${event.creator.lastName}` : '',
        creatorEmail: event.creator?.email || '',
        startDate: event.startDate?.toISOString() || '',
        endDate: event.endDate?.toISOString() || '',
        maxParticipants: event.maxParticipants || 0,
        currentParticipants: event.currentParticipants || 0,
        createdAt: event.createdAt.toISOString()
    }));
};

/**
 * Get detailed registration data for export
 * @returns {Promise<Array>} - Array of registrations with event and user info
 */
export const getRegistrationReport = async () => {
    const registrations = await prisma.registration.findMany({
        include: {
            event: {
                select: {
                    title: true,
                    startDate: true
                }
            },
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        },
        orderBy: {
            appliedAt: 'desc'
        }
    });

    // Format data for CSV export
    return registrations.map(reg => ({
        id: reg.id,
        eventTitle: reg.event?.title || '',
        eventStartDate: reg.event?.startDate?.toISOString() || '',
        userName: reg.user ? `${reg.user.firstName} ${reg.user.lastName}` : '',
        userEmail: reg.user?.email || '',
        status: reg.status,
        appliedAt: reg.appliedAt.toISOString(),
        approvedAt: reg.approvedAt?.toISOString() || '',
        completedAt: reg.completedAt?.toISOString() || ''
    }));
};

export default {
    getEventsByMonth,
    getDashboardStats,
    getEventReport,
    getRegistrationReport
};
