import { roles } from "../../utils/enum/enum.values.js";


export const endPoints={
    updateProfile:[roles.user],
    profile:[roles.user,roles.admin],
    getAccount:[roles.user,roles.admin],
    updatePassword:[roles.user],
}
