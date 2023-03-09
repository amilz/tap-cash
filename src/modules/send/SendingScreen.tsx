import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { SendNavScreen, SendStackRouteParams, TopNavScreen } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDepositAndSend } from "../../api/client";
import { useEffect, useMemo } from "react";
import { useUserProfile } from "../../components/profile-provider";
import { Screen } from "../../components/Screen";
import { formatUsd } from "../../common/number";
import { StyleSheet } from "react-native";
import { Badge } from "react-native-ui-lib";
import { COLORS } from "../../common/styles";
import { RecipientProfile } from "../../components/RecipientProfile";
import { TransactionStatus } from "../../components/TransactionStatus";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.SENDING>;

export function SendingScreen(props: Props): JSX.Element {
    const { recipient, amount, depositAmount } = props.route.params;
    const userProfileContext = useUserProfile();
    const depositAndSendContext = useDepositAndSend();
    const needsDeposit: boolean = depositAmount > 0;
    const loading: boolean = depositAndSendContext.deposit.loading || depositAndSendContext.send.loading;

    // Do the send. This will only run once because the
    // dependency array is empty.
    // TODO double, triple quadruple check this can only run once
    useEffect(() => {
        if (userProfileContext.email == null) {
            //TODO show some error state
            console.error("missing user email");
            return;
        } else if (userProfileContext.wallet == null) {
            //TODO show some error state
            console.error("missing user wallet");
            return;
        }
        depositAndSendContext.submit({
            sender: userProfileContext.email,
            recipient: recipient.email,
            amount: amount,
            depositAmount: depositAmount,
            senderSigner: userProfileContext.wallet.getKeypair()
        });
    }, []);

    return (
        <Screen>
            <View flexG padding-md style={{ paddingBottom: 66 }}>
                <View flexG center gap-sm>
                    <Text gray-dark bold style={STYLES.amount}>{formatUsd(amount)}</Text>
                    <RecipientProfile {...recipient} />
                    {(needsDeposit) && (
                        <View>
                            <TransactionStatus
                                {...depositAndSendContext.deposit}
                                defaultContent={
                                    <Text text-md gray-gray-medium>
                                        loading
                                    </Text>
                                }
                                loadingContent={
                                    <Text text-md gray-dark>
                                        depositing {formatUsd(depositAmount)} to your account
                                    </Text>
                                }
                                errorContent={
                                    <Text text-md error>
                                        failed to deposit {formatUsd(depositAmount)} to your account
                                    </Text>
                                }
                                successContent={
                                    <Text text-md gray-gray-medium>
                                        deposited {formatUsd(depositAmount)} to your account
                                    </Text>
                                }
                            />

                            <TransactionStatus
                                {...depositAndSendContext.send}
                                defaultContent={<Text />}
                                loadingContent={
                                    <Text text-md gray-dark>
                                        sending {formatUsd(amount)} from your account
                                    </Text>
                                }
                                errorContent={
                                    <Text text-md error>
                                        failed to send {formatUsd(amount)} from your account
                                    </Text>
                                }
                                successContent={
                                    <Text text-md gray-gray-medium>
                                        sent {formatUsd(amount)} from your account
                                    </Text>
                                }
                            />
                        </View>
                    )}
                </View>
                <Button
                    tertiary
                    label="Done"
                    disabled={loading}
                    onPress={() => props.navigation.getParent()?.navigate(TopNavScreen.HOME)}
                />
            </View>
        </Screen>
    )
}


const STYLES = StyleSheet.create({
    amount: {
        fontSize: 53,
    },
})
