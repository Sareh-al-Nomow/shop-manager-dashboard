
import api, { 
    ATTRIBUTES_ENDPOINT, 
    ATTRIBUTE_BY_ID_ENDPOINT, 
    ATTRIBUTE_GROUPS_ENDPOINT, 
    ATTRIBUTE_OPTIONS_ENDPOINT, 
    ATTRIBUTE_GROUP_LINKS_ENDPOINT 
} from './api';

export interface AttributeOption {
    attribute_option_id: number;
    uuid: string;
    attribute_id: number;
    attribute_code: string;
    option_text: string;
}

export interface Attribute {
    attribute_id: number;
    uuid: string;
    attribute_code: string;
    attribute_name: string;
    type: string;
    is_required: boolean;
    display_on_frontend: boolean;
    sort_order: number;
    is_filterable: boolean;
    options?: AttributeOption[];
    attribute_group_id?: number;
    groups?: AttributeGroupLink[];
}

export interface AttributeGroup {
    attribute_group_id: number;
    uuid: string;
    group_name: string;
    created_at?: string;
    updated_at?: string;
    links?: AttributeGroupAttributeLink[];
}

export interface AttributeGroupAttributeLink {
    attribute_group_link_id: number;
    attribute_id: number;
    group_id: number;
    attribute?: Attribute;
}

export interface CreateAttributeData {
    attribute_name: string;
    attribute_code: string;
    type: string;
    options?: string[];
    is_required?: boolean;
    is_filterable?: boolean;
    display_on_frontend?: boolean;
    sort_order?: number;
    attribute_group_id?: number;
}

export interface CreateAttributeOptionData {
    attribute_id: number;
    attribute_code: string;
    option_text: string;
}

export interface AttributeGroupLink {
    attribute_group_link_id: number;
    attribute_id: number;
    group_id: number;
}

export interface AttributeGroupLinkData {
    attribute_id: number;
    group_id: number;
}

export interface AttributeParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Attribute service for handling attribute-related API calls
 */
const attributeService = {
    /**
     * Get all attributes with optional filtering
     * @param params Optional parameters for filtering attributes
     * @returns Promise with attributes data
     */
    getAll: async (params?: AttributeParams) => {
        const queryParams = new URLSearchParams();

        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString());
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
            if (params.search !== undefined) queryParams.append('search', params.search);
            if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
            if (params.sortOrder !== undefined) queryParams.append('sortOrder', params.sortOrder);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString ? `${ATTRIBUTES_ENDPOINT}?${queryString}` : ATTRIBUTES_ENDPOINT;

        const response = await api.get(endpoint);
        return response.data;
    },

    /**
     * Get attribute by ID
     * @param id Attribute ID
     * @returns Promise with attribute data
     */
    getById: async (id: number) => {
        const response = await api.get(ATTRIBUTE_BY_ID_ENDPOINT(id));
        return response.data;
    },

    /**
     * Create a new attribute
     * @param attributeData Attribute data
     * @returns Promise with created attribute data
     */
    create: async (attributeData: CreateAttributeData): Promise<Attribute> => {
        const response = await api.post<Attribute>(ATTRIBUTES_ENDPOINT, attributeData);
        return response.data;
    },

    /**
     * Update an existing attribute
     * @param id Attribute ID
     * @param attributeData Updated attribute data
     * @returns Promise with updated attribute data
     */
    update: async (id: number, attributeData: Partial<CreateAttributeData>): Promise<Attribute> => {
        const response = await api.put<Attribute>(ATTRIBUTE_BY_ID_ENDPOINT(id), attributeData);
        return response.data;
    },

    /**
     * Delete an attribute
     * @param id Attribute ID
     * @returns Promise with success status
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(ATTRIBUTE_BY_ID_ENDPOINT(id));
    },

    /**
     * Get all attribute groups
     * @returns Promise with list of attribute groups
     */
    getGroups: async (): Promise<AttributeGroup[]> => {
        const response = await api.get<AttributeGroup[]>(ATTRIBUTE_GROUPS_ENDPOINT);
        return response.data;
    },

    /**
     * Create a new attribute group
     * @param name Group name
     * @returns Promise with created group data
     */
    createGroup: async (name: string): Promise<AttributeGroup> => {
        const response = await api.post<AttributeGroup>(ATTRIBUTE_GROUPS_ENDPOINT, { group_name: name });
        return response.data;
    },

    /**
     * Create a new attribute option
     * @param optionData Option data
     * @returns Promise with created option data
     */
    createOption: async (optionData: CreateAttributeOptionData): Promise<AttributeOption> => {
        const response = await api.post<AttributeOption>(ATTRIBUTE_OPTIONS_ENDPOINT, optionData);
        return response.data;
    },

    /**
     * Create a link between an attribute and a group
     * @param linkData Data containing attribute_id and group_id
     * @returns Promise with success status
     */
    createAttributeGroupLink: async (linkData: AttributeGroupLinkData): Promise<any> => {
        const response = await api.post(ATTRIBUTE_GROUP_LINKS_ENDPOINT, linkData);
        return response.data;
    },
};

export default attributeService;
