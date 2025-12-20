import { Parser } from 'json2csv';

/**
 * Generate CSV from events data
 * @param {Array} events - Array of event objects
 * @returns {string} - CSV string
 */
export const generateEventsCSV = (events) => {
    const fields = [
        { label: 'ID', value: 'id' },
        { label: 'Title', value: 'title' },
        { label: 'Description', value: 'description' },
        { label: 'Location', value: 'location' },
        { label: 'Category', value: 'category' },
        { label: 'Status', value: 'status' },
        { label: 'Created By', value: 'createdBy' },
        { label: 'Creator Email', value: 'creatorEmail' },
        { label: 'Start Date', value: 'startDate' },
        { label: 'End Date', value: 'endDate' },
        { label: 'Max Participants', value: 'maxParticipants' },
        { label: 'Current Participants', value: 'currentParticipants' },
        { label: 'Created At', value: 'createdAt' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(events);
};

/**
 * Generate CSV from registrations data
 * @param {Array} registrations - Array of registration objects
 * @returns {string} - CSV string
 */
export const generateRegistrationsCSV = (registrations) => {
    const fields = [
        { label: 'ID', value: 'id' },
        { label: 'Event Title', value: 'eventTitle' },
        { label: 'Event Start Date', value: 'eventStartDate' },
        { label: 'User Name', value: 'userName' },
        { label: 'User Email', value: 'userEmail' },
        { label: 'Status', value: 'status' },
        { label: 'Applied At', value: 'appliedAt' },
        { label: 'Approved At', value: 'approvedAt' },
        { label: 'Completed At', value: 'completedAt' }
    ];

    const parser = new Parser({ fields });
    return parser.parse(registrations);
};

export default {
    generateEventsCSV,
    generateRegistrationsCSV
};
