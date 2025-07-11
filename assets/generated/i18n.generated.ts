/* DO NOT EDIT, file generated by nestjs-i18n */
  
/* eslint-disable */
/* prettier-ignore */
import { Path } from "nestjs-i18n";
/* prettier-ignore */
export type I18nTranslations = {
    "common": {
        "Success": string;
        "Forbidden": string;
        "ForbiddenUserPermission": string;
        "ForbiddenOrganizationPermission": string;
        "TooManyRequests": string;
        "AccountInactive": string;
        "AccountRequired": string;
        "ApiInactive": string;
    };
    "error": {
        "ValidateFailed": string;
        "Conflict": string;
        "SystemError": string;
        "Database": {
            "NotFound": string;
            "InsertFailed": string;
            "UpdateFailed": string;
            "DeleteFailed": string;
        };
        "Token": {
            "AccessTokenExpired": string;
            "RefreshTokenExpired": string;
            "AccessTokenNoCache": string;
            "RefreshTokenNoCache": string;
            "Empty": string;
            "Invalid": string;
            "NoInCache": string;
            "WrongIp": string;
        };
        "Register": {
            "ExistEmailAndPhone": string;
            "ExistEmail": string;
            "ExistPhone": string;
            "ExistUsername": string;
        };
        "Login": {
            "WrongPassword": string;
        };
        "User": {
            "WrongPassword": string;
            "WrongRole": string;
        };
        "Role": {
            "Inactive": string;
        };
    };
};
/* prettier-ignore */
export type I18nPath = Path<I18nTranslations>;
