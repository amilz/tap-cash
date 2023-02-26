import { Circle, PaymentCreationRequest, CardCreationRequest, Card, TransferCreationRequest, Transfer, BusinessRecipientAddressCreationRequest, BusinessRecipientAddressObject, ChannelResponse } from "@circle-fin/circle-sdk";
import { CIRCLE_API_KEY, CIRCLE_ENVIRONMENT } from "../constants";

export class CircleMainClient {
    private readonly sdk: Circle;

    private constructor(sdk: Circle) {
        this.sdk = sdk;
    }


    public static ofDefaults(): CircleMainClient {
        return new CircleMainClient(new Circle(CIRCLE_API_KEY, CIRCLE_ENVIRONMENT));
    }


    /**
     * Dunno what this is for, just an example.
     *
     * @returns
     */
    public async listChannels(): Promise<ChannelResponse[] | undefined> {
        const result = await this.sdk.channels.listChannels();
        return result.data.data;
    }

    /**
     * 
     * @param paymentDetail PaymentCreationRequest
     * @returns a payment ID as a string
     */
    public async createAndSendPayment(paymentDetail: PaymentCreationRequest): Promise<string | undefined> {
        let payementResponse = await this.sdk.payments.createPayment(paymentDetail);
        return payementResponse.data.data?.id;
    }

    /**
     * Add a new Credit Card 
     * @param cardDetail 
     * @returns unique Id of card
     */
    public async addCreditCard(cardDetail: CardCreationRequest): Promise<string | undefined> {
        let cardResponse = await this.sdk.cards.createCard(cardDetail);
        return cardResponse.data.data?.id;
    }

    /**
     * Fetch an existing Credit Card 
     * @param id  
     * @returns G
     */
    public async tryFetchCard(id: string): Promise<Card | undefined> {
        let card = await this.sdk.cards.getCard(id);
        return card.data?.data;
    }


    public async transferUsdc(transferDetail: TransferCreationRequest): Promise<Transfer | undefined> {
        let transfer = await this.sdk.transfers.createTransfer();
        return transfer.data.data;
    }

    public async createDestinationAddress(destination: BusinessRecipientAddressCreationRequest): Promise<BusinessRecipientAddressObject | undefined> {
        let response = await this.sdk.addresses.createBusinessRecipientAddress();
        return response.data.data;
    }

}
