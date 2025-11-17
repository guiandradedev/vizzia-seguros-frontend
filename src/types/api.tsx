export interface ResponseAdapter<T> {
    id: string,
    attributes: T,
    links: {
        self: string
    }
}

export interface Vehicle {
    id: number;
    plate: string;
    model: string;
    color: string;
    year: number;
    odometer: string;
    brand: number;
    motorization: string;
    transmission: string;
    use_type: string;
    userId: number;
    fipe: string;
    park_type: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    cnhNumber: string;
    // outros campos do usuário podem ser adicionados aqui
}

export interface Insurance {
    id_insurance: number;
    vehicle: Vehicle;
    user: User;
    status: 'Pending' | 'Approved' | 'Denied' | 'Cancel';
    estimated_price: number;
    created_at: string;
}

export interface InsuranceEvaluationRequest {
    id_insurance: number;
    status: 'Approved' | 'Denied' | 'Pending' | 'Cancel';
}