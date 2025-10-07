export interface IUser {
    _id: string;
    name: string;
    age: number;
    address: string;
    avatar: string;
    email: string;
    role: {
        _id: string;
        name: string;
    };
    company: {
        _id: string;
        name: string;
    }
    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
    }[];
    connected: { _id: string; }[];

    isActive: boolean;
    // password:string;
    // gender:string;
}