
export interface AuthResponse {
    idToken:string,
    email:string,
    refreshToken:string,
    expiresIn:string,
    localId:string
    registerd?:boolean
}

export interface RegisterUser {
    id:string,
    email:any,
    password: any,
    isActive :boolean
}

export interface ProductList {
    id: string,
    productName: string,
    userId :any
}

export interface PartnersList {
    id: string,
    firstName: string,
    middleName: string,
    lastName: string,
    mobileNumber: any,
    userId :any
}
export interface InvestmentList {
    id: string,
    name: string,
    amount: any,
    note: string,
    date: any,
    userId :any
}

export interface RentProductList {
    id: string,
    productNumber: number,
    productName: string,
    rent: number,
    userId :any
}

export interface PurchaseList {
    id: any,
    userId: any,
    productUniqueNumber: number,
    productid: any,
    productDes: any,
    productDate: any,
    productSize: any,
    purchaseAmount: number,
    shellDiscount: number,
    shellAmount: number | null,
    productProfit: number,
    customerName: string,
    customerNumber: number,
    isShell: boolean,
    createDate: any,
    finalAmount: number,
    invoiceNo: number,
    invoiceDate: any,
    firmName: string,
    firmAddress: string,
    invoiceStatus: string,

}

export interface RentList {
    id:any,
    billNo?:any,
    rentProducts:string,
    customerName:string,
    status:string,
    address?:string,
    othermobileNumber?:any,
    mobileNumber:any,
    rent:any,
    pickupDateTime:any,
    advance:any,
    returnDateTime:any,
    deposite:any,
    orderDate:any,
    returnAmount:any,
    aadharCard:any,
    total?:any,
    userId:any
}

export interface ExpensesList {
    id:any,
    billno?:any,
    amount:any,
    bank:string,
    notes:any,
    paymenttype:any,
    accounttype:any,
    status:any,
    date:any,
    userId:any
}
export interface BalanceList {
    id:any,
    cashBalance:any,
    bankDetails:any,
    userId:any
}
