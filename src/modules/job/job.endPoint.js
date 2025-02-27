import { roles } from "../../utils/enum/enum.values.js"


const endPoints={
    addJob:[roles.user],
    updateAndDelete:[roles.user],
    getJobs:[roles.user],
    applyToJob:[roles.user],
    acceptOrRejectApplicant:[roles.user],
}


export default endPoints