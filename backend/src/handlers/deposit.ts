import * as anchor from "@project-serum/anchor";
import { ApiResponseStatus } from "../shared/api";
import { ApiError } from "../shared/error";
import { CircleEmulator } from "../circle/circle-emulator";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { TapCashClient } from "../program/sdk";
import { EmailAddress, AccountId } from "../shared/member";

//TODO tests

//TODO tests


export interface DepositArgs {
    emailAddress: EmailAddress;
    destinationAccountId: AccountId;
    amount: number;
    //TODO something about handling credit card info
    //TODO probably the user's private key
}


export interface DepositResult {
    //TODO something about the result of the deposit attempt
    result: ApiResponseStatus,
    amount?: number
}

const SIMULATOR_CLIENT = CircleEmulator.ofDefaults();
const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();

export async function deposit(request: DepositArgs): Promise<DepositResult> {
    // TODO: delegate the credit card retrieval and processing to Circle client

    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.emailAddress);

    try {
        await SIMULATOR_CLIENT.transferUsdc({ destinationAtaString: usdcAddress.toString(), amount: request.amount });
        return {
            result: ApiResponseStatus.SUCCESS,
            amount: request.amount
        }
    }
    catch {
        return {
            result: ApiResponseStatus.SERVER_ERROR,
        }
    }


}
