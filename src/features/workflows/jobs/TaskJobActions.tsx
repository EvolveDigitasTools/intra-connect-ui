import { Button } from "flowbite-react";
import { convertMinutes, getTimeDifference, getTimeDifferencefromNow, minifyTimeUnit } from "../../../utils";

interface TaskJobActionProps {
    userEmail: string,
    configDetails: {
        approvers: string[],
        assignees: string[],
        id: number,
        timeNeeded: number,
        timeStarted: string,
        timeUnit: 'minutes' | 'hours' | 'days' | 'weeks'
    },
    jobDetails: {
        status: 'started' | 'done',
        startedAt: Date,
        completedAt?: Date
    },
    taskModalAction: () => void
}

export default function TaskJobAction({ userEmail, configDetails, jobDetails, taskModalAction }: TaskJobActionProps) {
    const time = jobDetails.status == "started" ? convertMinutes(getTimeDifferencefromNow(jobDetails.startedAt.toString())) : (jobDetails.status == "done" ? convertMinutes(getTimeDifference(jobDetails.startedAt.toString(), jobDetails.completedAt?.toString() ?? '')) : null)

    // const canPerformAction = true
    const canPerformAction = jobDetails.status == "started" ? configDetails.assignees.includes(userEmail) : (jobDetails.status == 'done' ? configDetails.approvers.includes(userEmail) : false)

    const getActionDoneMessage = (status: 'started' | 'done' | 'approved' | 'rejected'): string => {
        switch (status) {
            case 'started':
            case 'rejected':
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
        <div className="text-xs mb-2">{`${time} (${configDetails.timeNeeded} ${minifyTimeUnit(configDetails.timeUnit)})`}</div>
        <div className="flex justify-center">{canPerformAction ? <Button size='xs' onClick={taskModalAction}>{jobDetails.status == 'started' ? 'Complete Task' : 'Approve Task'}</Button> : <Button size='xs' disabled>{getActionDoneMessage(jobDetails.status)}</Button>}</div>
    </section>
}