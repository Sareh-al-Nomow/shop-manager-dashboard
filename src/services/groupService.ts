import api, { GROUPS_ENDPOINT, GROUP_BY_ID_ENDPOINT } from './api';

export interface Group {
    id: number;
    uuid: string;
    group_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface GroupResponse {
    data: Group[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Group service for handling user group-related API calls
 */
const groupService = {
    /**
     * Get all user groups
     * @returns Promise with user groups data as an array
     */
    getAll: async (): Promise<Group[]> => {
        const response = await api.get(GROUPS_ENDPOINT);
        return response.data;
    },

    /**
     * Get user group by ID
     * @param id Group ID
     * @returns Promise with user group data
     */
    getById: async (id: number): Promise<Group> => {
        const response = await api.get(GROUP_BY_ID_ENDPOINT(id));
        return response.data;
    }
};

export default groupService;
