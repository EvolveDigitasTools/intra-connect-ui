import { Button } from "flowbite-react";
import { convertMinutes, getTimeDifference, getTimeDifferencefromNow, minifyTimeUnit } from "../../../utils";
import { StepDataConfigDetails, StepDataJobDetails } from "../../../interface";

interface TaskJobActionProps {
    configDetails: StepDataConfigDetails,
    jobDetails: StepDataJobDetails,
    taskModalAction: () => void
}

export default function TaskJobAction({ configDetails, jobDetails, taskModalAction }: TaskJobActionProps) {
    const time = ["started", "fix"].includes(jobDetails.status) ? convertMinutes(getTimeDifferencefromNow(jobDetails?.startedAt ?? '')) : convertMinutes(getTimeDifference(jobDetails.startedAt ?? '', jobDetails.approvedAt ?? jobDetails.completedAt ?? ''))


    const getActionDoneMessage = (status: "started" | "done" | "approved" | "incomplete" | "fix"): string => {
        switch (status) {
            case 'started':
            case 'fix':
                return 'Task InProgress'
            case 'done':
                return 'Awaiting Approval'
            case 'approved':
                return 'New Task Started'
            default:
                return ''
        }
    }

    return <section>
        {jobDetails.statusMessage.length > 0 && <div className="text-xs mb-1">Remarks: {jobDetails.statusMessage}</div>}
        <div className="text-xs mb-1">{`${time} (${configDetails.timeNeeded} ${minifyTimeUnit(configDetails.timeUnit)})`}</div>
        {jobDetails.status != 'approved' && <div className="flex justify-center"><Button size='xs' onClick={taskModalAction} disabled={!jobDetails.canPerformAction}>{jobDetails.canPerformAction ? (['started', 'fix'].includes(jobDetails.status) ? 'Complete Task' : 'Approve Task') : getActionDoneMessage(jobDetails.status)}</Button></div>}
    </section>
}