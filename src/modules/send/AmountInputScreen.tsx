import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { View } from "../../components/View";
import { NumberInput } from "react-native-ui-lib";
import { StyleSheet } from "react-native";
import { COLORS, TextStyleProps } from "../../common/styles";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "../../components/Text";
import { Screen } from "../../components/Screen";
import { useUserProfile } from "../../components/profile-provider";
import { formatUsd } from "../../common/number";
import { MAX_TX_AMOUNT } from "../../common/constants";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.AMOUNT_INPUT>;

export function AmountInputScreen(props: Props): JSX.Element {
    const [amount, setAmount] = useState<number | undefined>();
    const [error, setError] = useState<string | undefined>();
    const userProfileContext = useUserProfile();
    const accountBalance: number = useMemo(() => (
        userProfileContext.usdcBalance ?? 0
    ), [userProfileContext.usdcBalance]);

    useEffect(() => {
        userProfileContext.syncUsdcBalance();
    }, [userProfileContext.email]);

    // clear errors when the user changes the amount since
    // it may be valid again
    useEffect(() => {
        setError(undefined);
    }, [amount]);

    const amountValid: boolean = (amount != null) && amount > 0;
    const handleValueChange = (newValue: number) => {
        if (newValue <= MAX_TX_AMOUNT) {
            setAmount(newValue);
        }
        else {
            setAmount(9999.99);
        }
    };

    const onSubmit = useCallback(() => {
        if ((amount == null) || (amount <= 0)) {
            setError("Please enter a positive amount.");
            return;
        }
        if (amount > MAX_TX_AMOUNT) {
            setError(`Unable to send more than ${formatUsd(MAX_TX_AMOUNT)}!`);
            return;
        }
        const depositAmount: number = Math.max(0, amount - accountBalance);
        props.navigation.navigate(
            SendNavScreen.CONFIRM,
            {
                ...props.route.params,
                amount: amount,
                depositAmount: depositAmount
            }
        );
    }, [props.navigation.navigate, amount]);

    const insufficientBalance: boolean = (amount != null) && (accountBalance < amount);
    const textColorStyle: TextStyleProps = insufficientBalance ? {
        "error": true
    } : {
        "gray-dark": true
    };
    const buttonLabel: string = insufficientBalance ? "Deposit funds & Send" : "Send";

    return (
        <Screen spread padding-md>
            <View gap-md top left row flexS>
                <Text gray-medium text-md>To</Text>
                <Text gray-medium text-md bold>{props.route.params.recipient.email}</Text>
            </View>
            <View centerV gap-sm flexG>
                {/* @ts-ignore this component's type validation is fucked up*/}
                <NumberInput
                    onChangeNumber={(v: { number: number }) => handleValueChange(v.number)}
                    onSubmitEditing={onSubmit}
                    leadingText="$"
                    fractionDigits={2}
                    style={STYLES.text}
                    leadingTextStyle={STYLES.leadingText}
                    placeholder={"0"}
                    centered
                    autoFocus
                    maxLength={7}
                    // TODO ADD value here
                />
                <Text center text-md {...textColorStyle}>
                    Balance: {formatUsd(accountBalance)}
                </Text>
            </View>
            {error && (
                <View flexG center gap-sm>
                    <Text text-lg gray-dark center>Try again</Text>
                    <Text text-md gray-medium center error>{error}</Text>
                </View>
            )}
            <Button primary label={buttonLabel} onPress={onSubmit} disabled={!amountValid} />
        </Screen>
    )
}


const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
        color: COLORS.grayDark,
        fontFamily: "Jost-Bold"
    },

    leadingText: {
        fontSize: 40,
        color: COLORS.grayDark,
        fontFamily: "Jost-Bold",
        marginRight: 5,
        alignSelf: "flex-start"
    }
})
