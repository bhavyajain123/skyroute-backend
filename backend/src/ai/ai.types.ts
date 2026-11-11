export interface TravelRecommendationInput{
    origin:string;
    destination:string;
    departureDate?:string;
    returnDate?:string;
    budget?:number;
    passengers?:number;
    travelClass?:"economy" | "premium_economy" | "business" | "first";
    preferences?: string[];
}
export interface AIResponse{
    success:boolean;
    message:string;
    data?:string;
}