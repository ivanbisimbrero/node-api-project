export interface Company {
    id?: string;
    company_typeId: string;
    name: string;
    address?: string;
    phone?: string;
    cif?: string;
    active: boolean;
    admin: boolean;
}