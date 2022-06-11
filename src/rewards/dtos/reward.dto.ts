export class RewardDTO{
        offerId: number;
        quantityRemaining?: number;
        isQuantityLimitedByDailyLimit: boolean;
        cost: number;
        name: string;
}

export class Reward{
    id: string;
    offerId: number;
    quantityRemaining?: number;
    isQuantityLimitedByDailyLimit: boolean;
    cost: number;
    name: string;
    createdAt: string;
}

export class RewardClientResponse{
    OfferId: number;
    QuantityRemaining?: number;
    Cost: number;
    Name: string;
    ImageThumbUrl: string;
    TermsAndConditionsExtended: string;
    OutletName: string;
    IsQuantityLimitedByDailyLimit: boolean;
}