import { FlatList, Pressable } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "../../components/TextInput";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { useQueryRecipients } from "../../api/client";
import React from "react";
import { useStateWithDebounce } from "../../common/debounce";
import { EmailAddress, MemberPublicProfile } from "../../shared/member";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useUserProfile } from "../../components/profile-provider";
import { COLORS, ViewStyleProps } from "../../common/styles";
import { Avatar, GridList } from "react-native-ui-lib";


type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.RECIPIENT_INPUT>;


export function RecipientInputScreen(props: Props): JSX.Element {
    const userProfileContext = useUserProfile();
    const recipientQueryContext = useQueryRecipients();
    const [recipient, setRecipient] = useStateWithDebounce<EmailAddress | undefined>(query => {
        if (query !== undefined) {
            recipientQueryContext.submit({ emailQuery: query, limit: 10 });
        }
    }, 250);

    const allowedRecipients: MemberPublicProfile[] = useMemo(() => {
        const members = recipientQueryContext.data;
        if (members == null) return [];
        return members.filter(m => m.email !== userProfileContext.email);
    }, [recipientQueryContext.data, userProfileContext.email]);

    const [inputFocused, setInputFocused] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string | undefined>();

    //TODO this styling stuff should really be in TextInput
    const inputFieldStyle: ViewStyleProps = useMemo(() => {
        if (validationError !== undefined) {
            return { "bordered-error": true };

        } else if (inputFocused) {
            return { "bordered-focused": true };

        } else {
            return { "bordered": true };
        }
    }, [inputFocused, validationError]);

    // reset validation erro when the user changes the input since
    // they may have changed it to something valid
    useEffect(() => {
        setValidationError(undefined);
    }, [recipient]);

    const onSubmit = useCallback((finalRecipient?: EmailAddress) => {
        if (finalRecipient === undefined) {
            setValidationError("Recipient is required.");
            return;
        }
        // this can happen if the user manually types in their own email
        if (userProfileContext.email === finalRecipient) {
            setValidationError("Cannot send to yourself.");
            return;
        }
        if ((allowedRecipients.find(m => m.email === finalRecipient) == null)) {
            setValidationError("Try another email that has registered with Tap Cash.");
            return;
        }
        props.navigation.navigate(SendNavScreen.AMOUNT_INPUT, { recipient: finalRecipient });
    }, [recipient, allowedRecipients, props.navigation]);

    //TODO add (x) button to clear input
    return (
        <View center flexG>
            <View flex flexG padding-30 width="100%" gap-lg>
                <TextInput
                    onChangeText={setRecipient}
                    value={recipient}
                    placeholder="Enter email address"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onSubmitEditing={() => onSubmit(recipient)}
                    autoFocus
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    inputFieldStyle={inputFieldStyle}
                />
                {!validationError && (
                    <GridList
                        data={allowedRecipients}
                        renderItem={({ item }) => (
                            <MemberPublicProfileItem
                                recipient={item}
                                onPress={member => {
                                    setRecipient(member.email);
                                    onSubmit(member.email);
                                }} />
                        )}
                        keyExtractor={item => item.email}
                        contentContainerStyle={STYLES.suggestions}
                        itemSpacing={0}
                        listPadding={0}
                        numColumns={1}
                    />
                )}
                {validationError && (
                    <View center gap-sm>
                        <Text text-lg gray-dark center>No results</Text>
                        <Text text-md gray-medium center>{validationError}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

interface MemberPublicProfileItemProps {
    recipient: MemberPublicProfile;
    onPress: (recipient: MemberPublicProfile) => void;
}

function MemberPublicProfileItem(props: MemberPublicProfileItemProps): JSX.Element {
    return (
        <Pressable onPress={() => props.onPress(props.recipient)}>
            <View centerV left row style={STYLES.suggestionContainer}>
                <Avatar
                    source={{ uri: props.recipient.profile }}
                    size={48}
                />
                <View left centerV>
                    <Text text-md gray-dark>{props.recipient.name}</Text>
                    <Text gray-medium style={STYLES.suggestionEmail}>{props.recipient.email}</Text>
                </View>
            </View>
        </Pressable>
    )
}


const STYLES = StyleSheet.create({
    screen: {
        gap: 24,
    },

    suggestions: {
        fontSize: 18,
        gap: 0,
        justifyContent: "center",
    },

    suggestionContainer: {
        paddingVertical: 12,
        gap: 16,
    },

    suggestionEmail: {
        fontSize: 14
    }
})
