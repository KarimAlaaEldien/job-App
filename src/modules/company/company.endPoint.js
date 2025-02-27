import { roles } from "../../utils/enum/enum.values.js"


const endPoints={
    addCompany:[roles.user],
    updateCompany:[roles.user],
    deleteAndRestoreCompany:[roles.user,roles.admin],
    companyWithJobs:[roles.user,roles.admin],
    searchByName:[roles.user,roles.admin],
    uploadAndDelete:[roles.user,roles.admin],
    addHRToCompany:[roles.user]
}


export default endPoints