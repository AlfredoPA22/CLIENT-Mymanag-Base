export interface ICategory {
    _id:string;
    name:string;
    description:string;
    count_product:number;
    is_active:boolean;
}

export interface ICategoryInput {
    name?:string;
    description:string;
}