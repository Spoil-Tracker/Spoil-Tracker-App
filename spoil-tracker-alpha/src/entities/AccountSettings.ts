import {Resolver, Query, Mutation, Arg, registerEnumType, Field, ObjectType, ID} from "type-graphql";
import { COLLECTIONS } from "./CollectionNames";
import { db } from "../firestore";

enum ThemeType {
    light = "light",
    dark = "dark"
}

enum NotificationType {
    daily = "daily",
    weekly = "weekly",
    monthly = "monthly",
    never = "never"
}

registerEnumType(ThemeType, {name: "ThemeType"},)

registerEnumType(NotificationType, {name: "NotificationType"})

@ObjectType()
export class AccountSettings {
    @Field(type => ID)
    id!: string;

    @Field()
    account_id!: string;

    @Field(type => ThemeType)
    theme!: ThemeType;
    //Default: light

    @Field(type => NotificationType)
    notificationSettings!: NotificationType;
    //Default: never

    @Field()
    profilePicture!: string;
    //Should be an image link
    //Default: https://placecats.com/100/100
}


@Resolver(AccountSettings)
export class AccountSettingsResolver {

    @Query(() => AccountSettings)
    async getSettingsByAccountID(
        @Arg("account_id") account_id: string
    ): Promise<AccountSettings | null> {

        const snapshot = await db.collection(COLLECTIONS.ACCOUNT_SETTINGS)
            .where("account_id", "==", account_id)
            .limit(1)
            .get();

        if(snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as AccountSettings;
    }

    //Uses default values
    //You should not need to call this function directly
    @Mutation(() => AccountSettings)
    async createAccountSettings(
        @Arg("account_id") account_id: string
    ): Promise<AccountSettings> {
        //Check if an account exists with the given account_id
        const existingAccount = await db.collection(COLLECTIONS.ACCOUNT)
            .where("id", "==", account_id)
            .limit(1)
            .get();

        if(existingAccount.empty) {
            throw new Error(`An account with the id "${account_id} doesn't exist.`)
        }

        //Check if an AccountSettings document already exists with the given id
        const existingSetting = await this.getSettingsByAccountID(account_id);
        if(existingSetting != null) {
            throw new Error(`Settings for the account with the id "${account_id}" already exist.`)
        }

        //Pre-generate a firestore document ref with default values
        const docRef = db.collection(COLLECTIONS.ACCOUNT_SETTINGS).doc();
        const newSetting: AccountSettings = {
            id: docRef.id,
            account_id,
            theme: ThemeType.light,
            notificationSettings: NotificationType.never,
            profilePicture: "https://placecats.com/100/100"
        };

        await docRef.set(newSetting);
        return newSetting as AccountSettings;
    }


    @Mutation(() => AccountSettings)
    async editAccountSettings(
        @Arg("account_id") account_id: string,
        @Arg("theme") theme: string,
        @Arg("notificationSettings") notificationSettings: string,
        @Arg("profilePicture") profilePicture: string
    ): Promise<AccountSettings> {
        //Check if theme and notificationSettings adhere to their enums
        const themeEnum = ThemeType[theme as keyof typeof ThemeType];
        const notificationEnum = NotificationType[notificationSettings as keyof typeof NotificationType]

        if(!themeEnum || !notificationEnum)
        {
            throw new Error(`Error in theme or notification settings.
                Input theme: ${theme}
                Input notificationSettings: ${notificationSettings}`)
        }

        //Check if an account exists with the given account_id
        const existingAccount = await db.collection(COLLECTIONS.ACCOUNT)
            .where("id", "==", account_id)
            .limit(1)
            .get();

        if(existingAccount.empty) {
            throw new Error(`An account with the id "${account_id} doesn't exist.`)
        }

        //Check if an AccountSettings object already exists. If not, create a new one
        var existingSetting = await this.getSettingsByAccountID(account_id);

        if(existingSetting == null) {
            existingSetting = await this.createAccountSettings(account_id);
        }

        //Perform update on AccountSetting 
        const settingsDocument = await db.collection(COLLECTIONS.ACCOUNT_SETTINGS)
            .doc(existingSetting.id);

        settingsDocument.update({
            theme: themeEnum,
            notificationSettings: notificationEnum,
            profilePicture: profilePicture
        })

        //Return updated document
        return (await settingsDocument.get()).data() as AccountSettings;
    }
}